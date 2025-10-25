package com.freight.repo;

import com.freight.model.Freight;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FreightRepository extends JpaRepository<Freight, Long> {

    @Query(value = """
        SELECT * FROM freight f
        WHERE (
            COALESCE(f.status,'') ILIKE CONCAT('%', :q, '%')
            OR CAST(f.attributes AS TEXT) ILIKE CONCAT('%', :q, '%')
        )
        ORDER BY f.id DESC
        """,
            countQuery = """
        SELECT count(*) FROM freight f
        WHERE (
            COALESCE(f.status,'') ILIKE CONCAT('%', :q, '%')
            OR CAST(f.attributes AS TEXT) ILIKE CONCAT('%', :q, '%')
        )
        """,
            nativeQuery = true)
    Page<Freight> search(
            @Param("q") String q,
            Pageable pageable
    );
}
