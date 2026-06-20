import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMeQuery, useUpdateProfileMutation } from '@/generated/graphql'
import { usePhAddressSelector } from '@/hooks/usePhAddressSelector'

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  street: z.string().optional(),
  region: z.string().optional(),
  province: z.string().optional(),
  cityMunicipality: z.string().optional(),
  barangay: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function useHomeownerProfile() {
  const [{ data, fetching }, reexecuteMeQuery] = useMeQuery()
  const [, updateProfile] = useUpdateProfileMutation()
  const [savedMessage, setSavedMessage] = useState('')
  const phAddress = usePhAddressSelector()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const watchedRegion = watch('region') ?? ''
  const watchedProvince = watch('province') ?? ''
  const watchedCityMunicipality = watch('cityMunicipality') ?? ''
  const watchedBarangay = watch('barangay') ?? ''

  const prefilled = useRef(false)
  useEffect(() => {
    if (prefilled.current || !data?.me) return
    prefilled.current = true

    const me = data.me
    if (me.fullName) setValue('fullName', me.fullName)
    if (me.phone) setValue('phone', me.phone)

    const hp = me.homeownerProfile
    if (!hp) return

    if (hp.address) setValue('street', hp.address)
    phAddress.prefillFromAddress({
      region: hp.region,
      province: hp.province,
      cityMunicipality: hp.cityMunicipality,
    })
    if (hp.region) setValue('region', hp.region)
    if (hp.province) setValue('province', hp.province)
    if (hp.cityMunicipality) setValue('cityMunicipality', hp.cityMunicipality)
    if (hp.barangay) setValue('barangay', hp.barangay)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- phAddress recreated each render; ref guard ensures single execution
  }, [data, setValue])

  const handleRegionChange = (name: string) => {
    phAddress.selectRegion(name)
    setValue('region', name)
    setValue('province', '')
    setValue('cityMunicipality', '')
    setValue('barangay', '')
  }

  const handleProvinceChange = (name: string) => {
    phAddress.selectProvince(name)
    setValue('province', name)
    setValue('cityMunicipality', '')
    setValue('barangay', '')
  }

  const handleCityChange = (name: string) => {
    phAddress.selectCity(name)
    setValue('cityMunicipality', name)
    setValue('barangay', '')
  }

  const handleBarangayChange = (name: string) => {
    setValue('barangay', name)
  }

  const onSubmit = async (values: FormValues) => {
    setSavedMessage('')
    const result = await updateProfile({
      input: {
        fullName: values.fullName,
        phone: values.phone || undefined,
        address: values.street || undefined,
        barangay: values.barangay || undefined,
        cityMunicipality: values.cityMunicipality || undefined,
        province: values.province || undefined,
        region: values.region || undefined,
      },
    })

    if (result.error) {
      setError('root', { message: result.error.message })
      return
    }

    reexecuteMeQuery({ requestPolicy: 'network-only' })
    setSavedMessage('Profile saved.')
  }

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
    savedMessage,
    fetching,
    watchedRegion,
    watchedProvince,
    watchedCityMunicipality,
    watchedBarangay,
    provinces: phAddress.provinces,
    cities: phAddress.cities,
    barangays: phAddress.barangays,
    handleRegionChange,
    handleProvinceChange,
    handleCityChange,
    handleBarangayChange,
  }
}
