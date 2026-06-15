import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePhAddressSelector } from '../usePhAddressSelector'

describe('usePhAddressSelector', () => {
  it('starts with empty lists', () => {
    const { result } = renderHook(() => usePhAddressSelector())
    expect(result.current.provinces).toHaveLength(0)
    expect(result.current.cities).toHaveLength(0)
    expect(result.current.barangays).toHaveLength(0)
  })

  it('selectRegion populates provinces for a region with provinces', () => {
    const { result } = renderHook(() => usePhAddressSelector())

    act(() => {
      result.current.selectRegion('Region IV-A')
    })

    expect(result.current.provinces.length).toBeGreaterThan(0)
    expect(result.current.cities).toHaveLength(0)
  })

  it('selectRegion clears province and city when region changes', () => {
    const { result } = renderHook(() => usePhAddressSelector())

    act(() => {
      result.current.selectRegion('Region IV-A')
    })
    act(() => {
      result.current.selectProvince(result.current.provinces[0].name)
    })
    expect(result.current.cities.length).toBeGreaterThan(0)

    act(() => {
      result.current.selectRegion('Region III')
    })

    expect(result.current.cities).toHaveLength(0)
  })

  it('NCR edge case: selectRegion for NCR populates cities directly (no provinces)', () => {
    const { result } = renderHook(() => usePhAddressSelector())

    act(() => {
      result.current.selectRegion('National Capital Region')
    })

    // NCR has no provinces, so provinces list is empty but cities should be available
    expect(result.current.provinces).toHaveLength(0)
    expect(result.current.cities.length).toBeGreaterThan(0)
  })

  it('selectCity populates barangays', () => {
    const { result } = renderHook(() => usePhAddressSelector())

    act(() => {
      result.current.selectRegion('National Capital Region')
    })
    act(() => {
      result.current.selectCity('Taguig City')
    })

    expect(result.current.barangays.length).toBeGreaterThan(0)
  })

  it('prefillFromAddress resolves NCR + Taguig City correctly', () => {
    const { result } = renderHook(() => usePhAddressSelector())

    act(() => {
      result.current.prefillFromAddress({
        region: 'National Capital Region',
        province: undefined,
        cityMunicipality: 'Taguig City',
      })
    })

    expect(result.current.cities.length).toBeGreaterThan(0)
    expect(result.current.barangays.length).toBeGreaterThan(0)
  })

  it('prefillFromAddress resolves a non-NCR province correctly', () => {
    const { result } = renderHook(() => usePhAddressSelector())

    act(() => {
      result.current.prefillFromAddress({
        region: 'Region IV-A',
        province: 'Cavite',
        cityMunicipality: 'Bacoor City',
      })
    })

    expect(result.current.provinces.length).toBeGreaterThan(0)
    expect(result.current.cities.length).toBeGreaterThan(0)
  })
})
