-- Enable pgcrypto if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION batch_import_users_rpc(
    users_json JSONB
) RETURNS JSONB AS $$
DECLARE
    u JSONB;
    new_user_id UUID;
    success_count INT := 0;
BEGIN
    FOR u IN SELECT * FROM jsonb_array_elements(users_json)
    LOOP
        -- If UUID provided, use it, else generate one
        new_user_id := COALESCE((u->>'id')::UUID, gen_random_uuid());

        -- 1. Insert into auth.users (Supabase Auth)
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin
        ) VALUES (
            new_user_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            u->>'email',
            crypt(COALESCE(u->>'password', 'password123'), gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            jsonb_build_object('full_name', u->>'fullName', 'username', u->>'username'),
            false
        )
        ON CONFLICT (email) DO NOTHING;

        -- Check if it was inserted (if not, it already exists, so we fetch its ID)
        IF NOT FOUND THEN
            SELECT id INTO new_user_id FROM auth.users WHERE email = u->>'email';
        END IF;

        -- 2. Insert into shared.users (Prisma)
        INSERT INTO shared.users (
            id,
            email,
            username,
            full_name,
            first_name,
            last_name,
            password_hash,
            is_active
        ) VALUES (
            new_user_id,
            u->>'email',
            u->>'username',
            u->>'fullName',
            u->>'first_name',
            u->>'last_name',
            'managed_by_supabase',
            true
        )
        ON CONFLICT (email) DO UPDATE SET
            username = EXCLUDED.username,
            full_name = EXCLUDED.full_name,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name;

        success_count := success_count + 1;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'count', success_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
