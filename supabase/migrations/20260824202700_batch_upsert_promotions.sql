CREATE OR REPLACE FUNCTION batch_upsert_promotions(payload JSONB)
RETURNS JSONB AS $$
DECLARE
    item JSONB;
    success_count INT := 0;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(payload)
    LOOP
        INSERT INTO sim.promotion_decisions (
            id, enrollment_id, decision, notes, decided_by, decided_at
        ) VALUES (
            gen_random_uuid(),
            (item->>'enrollmentId')::uuid,
            (item->>'decision')::sim."PromotionStatus",
            item->>'notes',
            (item->>'decidedBy')::uuid,
            NOW()
        )
        ON CONFLICT (enrollment_id)
        DO UPDATE SET
            decision = EXCLUDED.decision,
            notes = EXCLUDED.notes,
            decided_by = EXCLUDED.decided_by,
            decided_at = EXCLUDED.decided_at;

        success_count := success_count + 1;
    END LOOP;

    RETURN jsonb_build_object('success', true, 'count', success_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
