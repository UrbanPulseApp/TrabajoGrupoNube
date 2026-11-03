package com.urbanpulse.repository;

import com.urbanpulse.entity.UrbanAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UrbanAssetRepository extends JpaRepository<UrbanAsset, String> {

    List<UrbanAsset> findByType(String type);

    @Query("SELECT a FROM UrbanAsset a WHERE a.latitude BETWEEN :minLat AND :maxLat AND a.longitude BETWEEN :minLon AND :maxLon")
    List<UrbanAsset> findWithinBoundingBox(@Param("minLat") Double minLat,
                                           @Param("maxLat") Double maxLat,
                                           @Param("minLon") Double minLon,
                                           @Param("maxLon") Double maxLon);
}
