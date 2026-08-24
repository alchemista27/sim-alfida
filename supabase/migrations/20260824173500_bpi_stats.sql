CREATE OR REPLACE FUNCTION get_bpi_stats(
    p_unit_id UUID,
    p_start_date DATE,
    p_end_date DATE
) RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    WITH filtered_records AS (
        SELECT 
            sholat_jamaah,
            sholat_dhuha,
            sholat_tahajud,
            tilawah_pages,
            puasa_sunnah,
            infaq
        FROM sim.bpi_mutabaah
        WHERE date >= p_start_date 
          AND date <= p_end_date
          AND user_id IN (
              SELECT user_id FROM sim.user_role_assignments 
              WHERE unit_id = p_unit_id
          )
    ),
    stats AS (
        SELECT
            COUNT(*) as total_records,
            SUM(sholat_jamaah) as sum_sholat_jamaah,
            COUNT(*) FILTER (WHERE sholat_dhuha = true) as count_dhuha,
            COUNT(*) FILTER (WHERE sholat_tahajud = true) as count_tahajud,
            SUM(tilawah_pages) as sum_tilawah_pages,
            COUNT(*) FILTER (WHERE puasa_sunnah = true) as count_puasa_sunnah,
            COUNT(*) FILTER (WHERE infaq = true) as count_infaq
        FROM filtered_records
    )
    SELECT jsonb_build_object(
        'totalRecords', total_records,
        'avgSholatJamaah', CASE WHEN total_records > 0 THEN (sum_sholat_jamaah::float / total_records) ELSE 0 END,
        'pctSholatDhuha', CASE WHEN total_records > 0 THEN (count_dhuha::float / total_records * 100) ELSE 0 END,
        'pctSholatTahajud', CASE WHEN total_records > 0 THEN (count_tahajud::float / total_records * 100) ELSE 0 END,
        'avgTilawahPages', CASE WHEN total_records > 0 THEN (sum_tilawah_pages::float / total_records) ELSE 0 END,
        'pctPuasaSunnah', CASE WHEN total_records > 0 THEN (count_puasa_sunnah::float / total_records * 100) ELSE 0 END,
        'pctInfaq', CASE WHEN total_records > 0 THEN (count_infaq::float / total_records * 100) ELSE 0 END
    ) INTO result
    FROM stats;

    RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
