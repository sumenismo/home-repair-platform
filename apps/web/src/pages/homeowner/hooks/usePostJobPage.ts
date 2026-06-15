import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router'
import { useCreateJobPostMutation, useMeQuery } from '@/generated/graphql'
import { usePhAddressSelector } from '@/hooks/usePhAddressSelector'
import { CATEGORIES } from '@/lib/job-status'

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum(CATEGORIES, { required_error: 'Please select a category' }),
  street: z.string().optional(),
  barangay: z.string().optional(),
  cityMunicipality: z.string().optional(),
  province: z.string().optional(),
  region: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function usePostJobPage() {
  const navigate = useNavigate()
  const [, createJobPost] = useCreateJobPostMutation()
  const [{ data: meData }] = useMeQuery()
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

  const autoFilled = useRef(false)
  useEffect(() => {
    if (autoFilled.current) return
    const hp = meData?.me?.homeownerProfile
    if (!hp) return
    autoFilled.current = true

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
  }, [meData, setValue])

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
    const result = await createJobPost({
      input: {
        title: values.title,
        description: values.description,
        category: values.category,
        street: values.street || undefined,
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

    void navigate('/homeowner', { replace: true })
  }

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    isSubmitting,
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
