import type { Sql } from '@home-repair/db'
import type { RegisterUserInput, UpdateProfileInput } from '../../generated/resolvers.js'

export type UserRow = {
  id: string
  email: string
  role: string
  fullName: string | null
  phone: string | null
  createdAt: Date
}

export type HomeownerProfileRow = {
  userId: string
  address: string | null
  barangay: string | null
  cityMunicipality: string | null
  province: string | null
  region: string | null
}

export type ServiceProviderProfileRow = {
  userId: string
  businessName: string | null
  tin: string | null
  isCompany: boolean
  tradeCategories: string[]
  serviceCities: string[]
  bio: string | null
  verified: boolean
}

export const IdentityService = {
  async createUser(
    sql: Sql,
    id: string,
    email: string,
    input: RegisterUserInput,
  ): Promise<UserRow> {
    const [user] = await sql<UserRow[]>`
      INSERT INTO users (id, email, role, full_name)
      VALUES (${id}, ${email}, ${input.role}, ${input.fullName ?? null})
      ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email
      RETURNING id, email, role, full_name, phone, created_at
    `
    return user
  },

  async getUser(sql: Sql, id: string): Promise<UserRow | null> {
    const [user] = await sql<UserRow[]>`
      SELECT id, email, role, full_name, phone, created_at
      FROM users WHERE id = ${id}
    `
    return user ?? null
  },

  async getHomeownerProfile(sql: Sql, userId: string): Promise<HomeownerProfileRow | null> {
    const [profile] = await sql<HomeownerProfileRow[]>`
      SELECT user_id, address, barangay, city_municipality, province, region
      FROM homeowner_profiles WHERE user_id = ${userId}
    `
    return profile ?? null
  },

  async getServiceProviderProfile(sql: Sql, userId: string): Promise<ServiceProviderProfileRow | null> {
    const [profile] = await sql<ServiceProviderProfileRow[]>`
      SELECT user_id, business_name, tin, is_company, trade_categories, service_cities, bio, verified
      FROM service_provider_profiles WHERE user_id = ${userId}
    `
    return profile ?? null
  },

  async updateProfile(sql: Sql, userId: string, input: UpdateProfileInput): Promise<UserRow> {
    const {
      fullName,
      phone,
      address,
      barangay,
      cityMunicipality,
      province,
      region,
      businessName,
      tin,
      isCompany,
      tradeCategories,
      serviceCities,
      bio,
    } = input

    const [user] = await sql<UserRow[]>`
      UPDATE users SET
        full_name  = COALESCE(${fullName ?? null}, full_name),
        phone      = COALESCE(${phone ?? null}, phone)
      WHERE id = ${userId}
      RETURNING id, email, role, full_name, phone, created_at
    `

    await sql`
      INSERT INTO homeowner_profiles (user_id, address, barangay, city_municipality, province, region)
      VALUES (
        ${userId},
        ${address ?? null},
        ${barangay ?? null},
        ${cityMunicipality ?? null},
        ${province ?? null},
        ${region ?? null}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        address          = COALESCE(EXCLUDED.address,          homeowner_profiles.address),
        barangay         = COALESCE(EXCLUDED.barangay,         homeowner_profiles.barangay),
        city_municipality = COALESCE(EXCLUDED.city_municipality, homeowner_profiles.city_municipality),
        province         = COALESCE(EXCLUDED.province,         homeowner_profiles.province),
        region           = COALESCE(EXCLUDED.region,           homeowner_profiles.region)
    `

    // For is_company and trade_categories, use separate insert/update values so that
    // omitting the field (undefined) preserves the existing DB value via COALESCE(null, existing)
    // rather than overwriting with false/[] which are non-null in PostgreSQL.
    const isCompanyInsert = isCompany ?? false
    const isCompanyUpdate = isCompany !== undefined ? isCompany : null
    const tradeCategoriesInsert = sql.array(tradeCategories ?? [])
    const tradeCategoriesUpdate = tradeCategories != null ? sql.array(tradeCategories) : null
    const serviceCitiesInsert = sql.array(serviceCities ?? [])
    const serviceCitiesUpdate = serviceCities != null ? sql.array(serviceCities) : null

    await sql`
      INSERT INTO service_provider_profiles (user_id, business_name, tin, is_company, trade_categories, service_cities, bio)
      VALUES (
        ${userId},
        ${businessName ?? null},
        ${tin ?? null},
        ${isCompanyInsert},
        ${tradeCategoriesInsert},
        ${serviceCitiesInsert},
        ${bio ?? null}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        business_name    = COALESCE(EXCLUDED.business_name,    service_provider_profiles.business_name),
        tin              = COALESCE(EXCLUDED.tin,              service_provider_profiles.tin),
        is_company       = COALESCE(${isCompanyUpdate}::boolean, service_provider_profiles.is_company),
        trade_categories = COALESCE(${tradeCategoriesUpdate},  service_provider_profiles.trade_categories),
        service_cities   = COALESCE(${serviceCitiesUpdate},   service_provider_profiles.service_cities),
        bio              = COALESCE(EXCLUDED.bio,              service_provider_profiles.bio)
    `

    return user
  },
}
