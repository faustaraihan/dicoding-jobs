<?php

namespace App\Enums;

enum Position: string
{
    case AccountingAndFinance = 'accounting_and_finance';
    case AdministrationAndCoordination = 'administration_and_coordination';
    case AndroidDeveloper = 'android_developer';
    case ArchitectureAndEngineering = 'architecture_and_engineering';
    case ArtsAndSports = 'arts_and_sports';
    case BackEndDeveloper = 'back_end_developer';
    case CloudEngineer = 'cloud_engineer';
    case CustomerService = 'customer_service';
    case DataAnalyst = 'data_analyst';
    case DataEngineer = 'data_engineer';
    case DataScientist = 'data_scientist';
    case DatabaseAdministration = 'database_administration';
    case DevOpsEngineer = 'devops_engineer';
    case EducationAndTraining = 'education_and_training';
    case FlutterDeveloper = 'flutter_developer';
    case FrontEndWebDeveloper = 'front_end_web_developer';
    case FullStackDeveloper = 'full_stack_developer';
    case GameDesigner = 'game_designer';
    case GameDeveloper = 'game_developer';
    case GameTester = 'game_tester';
    case GeneralServices = 'general_services';
    case HardwareEngineer = 'hardware_engineer';
    case HealthAndMedical = 'health_and_medical';
    case HospitalityAndTourism = 'hospitality_and_tourism';
    case HumanResources = 'human_resources';
    case IosDeveloper = 'ios_developer';
    case ItAndSoftware = 'it_and_software';
    case Legal = 'legal';
    case MachineLearningDeveloper = 'machine_learning_developer';
    case ManagementAndConsultancy = 'management_and_consultancy';
    case ManufacturingAndProduction = 'manufacturing_and_production';
    case MediaAndCreatives = 'media_and_creatives';
    case MobileAppsDeveloper = 'mobile_apps_developer';
    case MultiPlatformAppDeveloper = 'multi_platform_app_developer';
    case NetworkEngineer = 'network_engineer';
    case ProductDesigner = 'product_designer';
    case ProductManager = 'product_manager';
    case Programmer = 'programmer';
    case PublicServiceAndNgos = 'public_service_and_ngos';
    case QualityAssurance = 'quality_assurance_qa';
    case ReactDeveloper = 'react_developer';
    case SafetyAndSecurity = 'safety_and_security';
    case SalesAndMarketing = 'sales_and_marketing';
    case Sciences = 'sciences';
    case SecurityEngineer = 'security_engineer';
    case SiteReliabilityEngineer = 'site_reliability_engineer_sre';
    case SupplyChain = 'supply_chain';
    case SystemAnalyst = 'system_analyst';
    case UiUxDesigner = 'uiux_designer';
    case UxResearcher = 'ux_researcher';
    case WebDesigner = 'web_designer';
    case WebDeveloper = 'web_developer';
    case WebEngineer = 'web_engineer';
    case WebProgrammer = 'web_programmer';
    case WritingAndContent = 'writing_and_content';
    case Other = 'lainnya';

    public function label(): string
    {
        return match ($this) {
            self::AccountingAndFinance => 'Accounting and Finance',
            self::AdministrationAndCoordination => 'Administration and Coordination',
            self::AndroidDeveloper => 'Android Developer',
            self::ArchitectureAndEngineering => 'Architecture and Engineering',
            self::ArtsAndSports => 'Arts and Sports',
            self::BackEndDeveloper => 'Back-End Developer',
            self::CloudEngineer => 'Cloud Engineer',
            self::CustomerService => 'Customer Service',
            self::DataAnalyst => 'Data Analyst',
            self::DataEngineer => 'Data Engineer',
            self::DataScientist => 'Data Scientist',
            self::DatabaseAdministration => 'Database Administration',
            self::DevOpsEngineer => 'DevOps Engineer',
            self::EducationAndTraining => 'Education and Training',
            self::FlutterDeveloper => 'Flutter Developer',
            self::FrontEndWebDeveloper => 'Front-End Web Developer',
            self::FullStackDeveloper => 'Full-Stack Developer',
            self::GameDesigner => 'Game Designer',
            self::GameDeveloper => 'Game Developer',
            self::GameTester => 'Game Tester',
            self::GeneralServices => 'General Services',
            self::HardwareEngineer => 'Hardware Engineer',
            self::HealthAndMedical => 'Health and Medical',
            self::HospitalityAndTourism => 'Hospitality and Tourism',
            self::HumanResources => 'Human Resources',
            self::IosDeveloper => 'iOS Developer',
            self::ItAndSoftware => 'IT and Software',
            self::Legal => 'Legal',
            self::MachineLearningDeveloper => 'Machine Learning Developer',
            self::ManagementAndConsultancy => 'Management and Consultancy',
            self::ManufacturingAndProduction => 'Manufacturing and Production',
            self::MediaAndCreatives => 'Media and Creatives',
            self::MobileAppsDeveloper => 'Mobile Apps Developer',
            self::MultiPlatformAppDeveloper => 'Multi-Platform App Developer',
            self::NetworkEngineer => 'Network Engineer',
            self::ProductDesigner => 'Product Designer',
            self::ProductManager => 'Product Manager',
            self::Programmer => 'Programmer',
            self::PublicServiceAndNgos => 'Public Service and NGOs',
            self::QualityAssurance => 'Quality Assurance (QA)',
            self::ReactDeveloper => 'React Developer',
            self::SafetyAndSecurity => 'Safety and Security',
            self::SalesAndMarketing => 'Sales and Marketing',
            self::Sciences => 'Sciences',
            self::SecurityEngineer => 'Security Engineer',
            self::SiteReliabilityEngineer => 'Site Reliability Engineer (SRE)',
            self::SupplyChain => 'Supply Chain',
            self::SystemAnalyst => 'System Analyst',
            self::UiUxDesigner => 'UI/UX Designer',
            self::UxResearcher => 'UX Researcher',
            self::WebDesigner => 'Web Designer',
            self::WebDeveloper => 'Web Developer',
            self::WebEngineer => 'Web Engineer',
            self::WebProgrammer => 'Web Programmer',
            self::WritingAndContent => 'Writing and Content',
            self::Other => 'Lainnya',
        };
    }
}
