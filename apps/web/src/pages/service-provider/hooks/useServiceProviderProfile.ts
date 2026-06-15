import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMeQuery, useUpdateProfileMutation } from '@/generated/graphql'

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  businessName: z.string().optional(),
  isCompany: z.boolean(),
  tradeCategories: z.array(z.string()),
  serviceCities: z.array(z.string()),
  bio: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function useServiceProviderProfile() {
  const [{ data, fetching }, reexecuteMeQuery] = useMeQuery()
  const [, updateProfile] = useUpdateProfileMutation()
  const [savedMessage, setSavedMessage] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isCompany: false, tradeCategories: [], serviceCities: [] },
  })

  const isCompany = watch('isCompany')
  const tradeCategories = watch('tradeCategories')

  const prefilled = useRef(false)
  useEffect(() => {
    if (prefilled.current || !data?.me) return
    prefilled.current = true

    const me = data.me
    if (me.fullName) setValue('fullName', me.fullName)
    if (me.phone) setValue('phone', me.phone)

    const sp = me.serviceProviderProfile
    if (!sp) return
    if (sp.businessName) setValue('businessName', sp.businessName)
    setValue('isCompany', sp.isCompany)
    setValue('tradeCategories', sp.tradeCategories ?? [])
    setValue('serviceCities', sp.serviceCities ?? [])
    if (sp.bio) setValue('bio', sp.bio)
  }, [data, setValue])

  const toggleCategory = (cat: string) => {
    const current = tradeCategories ?? []
    if (current.includes(cat)) {
      setValue('tradeCategories', current.filter((c) => c !== cat))
    } else {
      setValue('tradeCategories', [...current, cat])
    }
  }

  const onSubmit = async (values: FormValues) => {
    setSavedMessage('')
    const result = await updateProfile({
      input: {
        fullName: values.fullName,
        phone: values.phone || undefined,
        businessName: values.businessName || undefined,
        isCompany: values.isCompany,
        tradeCategories: values.tradeCategories,
        serviceCities: values.serviceCities,
        bio: values.bio || undefined,
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
    control,
    onSubmit,
    errors,
    isSubmitting,
    savedMessage,
    fetching,
    isCompany,
    tradeCategories,
    setValue,
    toggleCategory,
  }
}
