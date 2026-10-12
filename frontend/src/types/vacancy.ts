export interface Company {
  name: string;
  business_sector: string;
  employee_count: string;
  logo_url: string;
}

export interface Location {
  id: number;
  name: string;
  province: string | null;
}

export interface Vacancy {
  id: number;
  title: string;
  company: Company;
  position: string;
  position_label: string;
  employment_type: string;
  employment_type_label: string;
  candidate_count: number;
  expires_at: string;
  location_id: number;
  location: Location;
  is_remote: boolean;
  description: string;
  show_salary: boolean;
  salary_min?: number;
  salary_max?: number | null;
  experience_level: string;
  experience_level_label: string;
  created_at: string;
  updated_at: string;
}

export interface VacancyListResponse {
  data: Vacancy[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

export interface VacancyDetailResponse {
  data: Vacancy;
}

export interface VacancyOption {
  value: string;
  label: string;
}

export interface VacancyOptionsResponse {
  data: {
    positions: VacancyOption[];
    employment_types: VacancyOption[];
    experience_levels: VacancyOption[];
    locations: Location[];
  };
}

export interface VacancyPayload {
  title: string;
  position: string;
  employment_type: string;
  candidate_count: number;
  expires_at: string;
  location_id: number;
  is_remote: boolean;
  description: string;
  salary_min: number;
  salary_max: number | null;
  show_salary: boolean;
  experience_level: string;
}
