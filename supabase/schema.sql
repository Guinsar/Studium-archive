-- Table principale des travaux déposés
create table travaux (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  auteur text not null,
  matricule text,
  annee int not null,
  type_travail text not null check (type_travail in ('memoire', 'expose', 'dissertation', 'these')),
  encadrant text,
  resume text not null,
  mots_cles text[] not null default '{}',
  fichier_url text not null,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'publie', 'refuse', 'retire')),
  consentement_diffusion boolean not null default false,
  consentement_le timestamptz,
  consultations int not null default 0,
  telechargements int not null default 0,
  depose_par uuid references auth.users(id),
  cree_le timestamptz not null default now()
);

-- Recherche plein texte sur titre, résumé et mots-clés.
-- Une colonne générée directement avec to_tsvector('french', ...) est
-- refusée par Postgres (la fonction n'est pas jugée immuable), on passe
-- donc par un déclencheur qui tient la colonne à jour à chaque écriture.
alter table travaux add column recherche tsvector;

create function travaux_recherche_maj() returns trigger as $$
begin
  new.recherche := to_tsvector(
    'french',
    coalesce(new.titre, '') || ' ' || coalesce(new.resume, '') || ' ' || array_to_string(new.mots_cles, ' ')
  );
  return new;
end;
$$ language plpgsql;

create trigger travaux_recherche_trigger
before insert or update on travaux
for each row execute function travaux_recherche_maj();

create index travaux_recherche_idx on travaux using gin(recherche);
create index travaux_statut_idx on travaux(statut);

-- Table des modérateurs : pour donner les droits de modération à un
-- utilisateur, il suffit d'ajouter une ligne ici avec son identifiant
-- (visible dans Authentication > Users), depuis le Table Editor Supabase.
create table moderateurs (
  user_id uuid primary key references auth.users(id)
);

alter table moderateurs enable row level security;

create policy "Un modérateur peut vérifier son propre statut"
  on moderateurs for select
  using (auth.uid() = user_id);

-- Row Level Security : lecture publique des travaux publiés uniquement
alter table travaux enable row level security;

create policy "Lecture publique des travaux publiés"
  on travaux for select
  using (statut = 'publie');

create policy "L'auteur voit son propre dépôt même en attente"
  on travaux for select
  using (auth.uid() = depose_par);

create policy "Un modérateur voit tous les travaux"
  on travaux for select
  using (auth.uid() in (select user_id from moderateurs));

create policy "Un utilisateur connecté peut déposer un travail"
  on travaux for insert
  with check (auth.uid() = depose_par and consentement_diffusion = true);

-- La validation (passage à 'publie' ou 'refuse') est réservée aux
-- utilisateurs listés dans la table 'moderateurs'.
create policy "Un modérateur peut mettre à jour le statut"
  on travaux for update
  using (auth.uid() in (select user_id from moderateurs));

-- Le droit moral de l'auteur (retrait de son travail) est perpétuel et
-- ne dépend pas d'une validation par un modérateur : l'auteur peut à
-- tout moment faire passer son propre travail au statut 'retire'.
create policy "L'auteur peut retirer son propre travail à tout moment"
  on travaux for update
  using (auth.uid() = depose_par)
  with check (statut = 'retire');

-- Bucket de stockage pour les fichiers PDF
insert into storage.buckets (id, name, public) values ('travaux-pdf', 'travaux-pdf', true)
  on conflict do nothing;

-- Favoris : chaque étudiant marque les travaux qu'il veut retrouver
create table favoris (
  user_id uuid references auth.users(id) not null,
  travail_id uuid references travaux(id) on delete cascade not null,
  cree_le timestamptz not null default now(),
  primary key (user_id, travail_id)
);

alter table favoris enable row level security;

create policy "Un utilisateur voit ses propres favoris"
  on favoris for select
  using (auth.uid() = user_id);

create policy "Un utilisateur ajoute ses propres favoris"
  on favoris for insert
  with check (auth.uid() = user_id);

create policy "Un utilisateur retire ses propres favoris"
  on favoris for delete
  using (auth.uid() = user_id);
