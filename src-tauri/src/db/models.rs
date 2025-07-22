use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: Option<i64>,
    pub username: String,
    pub password_hash: String,
    pub account_type: String,
    pub status: String,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Login {
    pub user_id: i64,
    pub username: String,
    pub ip_address: String,
    pub status: String,
    pub last_login: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Fokotany {
    pub id: Option<i64>,
    pub nom: String,
    pub px: Option<f64>,
    pub py: Option<f64>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Hameau {
    pub id: Option<i64>,
    pub nom: String,
    pub px: f64,
    pub py: f64,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Vaccin {
    pub id: Option<i64>,
    pub nom: String,
    pub duree: Option<i64>,
    pub date_arrivee: Option<NaiveDate>,
    pub date_peremption: Option<NaiveDate>,
    pub description: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
    pub duree_jours: Option<i64>,
    pub age_annees: i64,
    pub age_mois: i64,
    pub age_jours: i64,
    pub lot: Option<String>,
    pub stock: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Enfant {
    pub id: Option<i64>,
    pub nom: String,
    pub prenom: String,
    pub code: Option<String>,
    pub date_naissance: NaiveDate,
    pub age_premier_contact: Option<i64>,
    pub sexe: String,
    pub nom_mere: Option<String>,
    pub nom_pere: Option<String>,
    pub domicile: Option<String>,
    pub fokotany: Option<String>,
    pub hameau: Option<String>,
    pub telephone: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VaccinPrerequis {
    pub id: Option<i64>,
    pub vaccin_id: i64,
    pub prerequis_id: i64,
    pub strict: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VaccinSuite {
    pub id: Option<i64>,
    pub vaccin_id: i64,
    pub suite_id: i64,
    pub strict: bool,
    pub delai: i64,
    pub type_suite: String,
    pub description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Vaccination {
    pub id: Option<i64>,
    pub enfant_id: i64,
    pub vaccin_id: i64,
    pub date_vaccination: NaiveDate,
    pub remarque: Option<String>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChildHistory {
    pub id: Option<i64>,
    pub child_id: i64,
    pub action_type: String,
    pub action_date: Option<DateTime<Utc>>,
    pub user_id: Option<i64>,
    pub old_data: Option<String>,
    pub new_data: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeletedChildrenLog {
    pub id: Option<i64>,
    pub original_id: i64,
    pub action_date: Option<DateTime<Utc>>,
    pub user_id: Option<i64>,
    pub child_data: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Notification {
    pub id: Option<i64>,
    pub user_id: Option<i64>,
    pub title: String,
    pub message: String,
    pub notification_type: String,
    pub category: String,
    pub is_read: Option<bool>,
    pub action_link: Option<String>,
    pub entity_type: Option<String>,
    pub entity_id: Option<i64>,
    pub created_at: Option<DateTime<Utc>>,
    pub expires_at: Option<DateTime<Utc>>,
}
