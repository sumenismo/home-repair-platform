import { useState } from 'react'
import {
  getAllRegions,
  getProvincesByRegion,
  getMunicipalitiesByProvince,
  getBarangaysByMunicipality,
} from '@aivangogh/ph-address'

const ALL_REGIONS = getAllRegions()

export type PhAddressValues = {
  region?: string | null
  province?: string | null
  cityMunicipality?: string | null
}

export function usePhAddressSelector() {
  const [selectedRegionCode, setSelectedRegionCode] = useState('')
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('')
  const [selectedCityCode, setSelectedCityCode] = useState('')

  const provinces = selectedRegionCode ? getProvincesByRegion(selectedRegionCode) : []
  const cities = selectedProvinceCode ? getMunicipalitiesByProvince(selectedProvinceCode) : []
  const barangays = selectedCityCode ? getBarangaysByMunicipality(selectedCityCode) : []

  function selectRegion(name: string) {
    const regionObj = ALL_REGIONS.find((r) => r.name === name)
    const code = regionObj?.psgcCode ?? ''
    const regionProvinces = code ? getProvincesByRegion(code) : []
    setSelectedRegionCode(code)
    // NCR edge case: no provinces under a region means the region code acts as province code
    setSelectedProvinceCode(regionProvinces.length === 0 ? code : '')
    setSelectedCityCode('')
  }

  function selectProvince(name: string) {
    const provinceObj = (selectedRegionCode ? getProvincesByRegion(selectedRegionCode) : []).find(
      (p) => p.name === name,
    )
    setSelectedProvinceCode(provinceObj?.psgcCode ?? '')
    setSelectedCityCode('')
  }

  function selectCity(name: string) {
    const cityObj = (selectedProvinceCode ? getMunicipalitiesByProvince(selectedProvinceCode) : []).find(
      (c) => c.name === name,
    )
    setSelectedCityCode(cityObj?.psgcCode ?? '')
  }

  function prefillFromAddress(addr: PhAddressValues) {
    const regionObj = ALL_REGIONS.find((r) => r.name === addr.region)
    const regionCode = regionObj?.psgcCode ?? ''
    setSelectedRegionCode(regionCode)

    const provincesInRegion = regionCode ? getProvincesByRegion(regionCode) : []
    const provinceObj = provincesInRegion.find((p) => p.name === addr.province)
    const provinceCode = provincesInRegion.length === 0 ? regionCode : (provinceObj?.psgcCode ?? '')
    setSelectedProvinceCode(provinceCode)

    const citiesInProvince = provinceCode ? getMunicipalitiesByProvince(provinceCode) : []
    const cityObj = citiesInProvince.find((c) => c.name === addr.cityMunicipality)
    setSelectedCityCode(cityObj?.psgcCode ?? '')
  }

  return { provinces, cities, barangays, selectRegion, selectProvince, selectCity, prefillFromAddress }
}
