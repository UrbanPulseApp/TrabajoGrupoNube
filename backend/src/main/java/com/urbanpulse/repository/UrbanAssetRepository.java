package com.urbanpulse.repository;

import com.urbanpulse.entity.UrbanAsset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UrbanAssetRepository extends JpaRepository<UrbanAsset, String> {

    List<UrbanAsset> findByType(String type);
}