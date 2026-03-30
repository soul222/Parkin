-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.push_subscriptions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT push_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT push_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.settings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  max_mobil integer DEFAULT 30,
  max_motor integer DEFAULT 30,
  stream_url text,
  stream_type character varying DEFAULT 'youtube'::character varying CHECK (stream_type::text = ANY (ARRAY['youtube'::character varying, 'rtsp'::character varying]::text[])),
  line_position numeric DEFAULT 0.6,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid,
  line_orientation character varying DEFAULT 'horizontal'::character varying,
  discord_webhook_url text,
  CONSTRAINT settings_pkey PRIMARY KEY (id),
  CONSTRAINT settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nama character varying NOT NULL,
  username character varying NOT NULL UNIQUE,
  email character varying NOT NULL UNIQUE,
  password character varying NOT NULL,
  role character varying DEFAULT 'admin'::character varying CHECK (role::text = ANY (ARRAY['admin'::character varying, 'security'::character varying]::text[])),
  status character varying DEFAULT 'offline'::character varying CHECK (status::text = ANY (ARRAY['online'::character varying, 'offline'::character varying]::text[])),
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  no_hp character varying,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.vehicle_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  jenis_kendaraan character varying NOT NULL CHECK (jenis_kendaraan::text = ANY (ARRAY['mobil'::character varying, 'motor'::character varying]::text[])),
  status character varying NOT NULL CHECK (status::text = ANY (ARRAY['in'::character varying, 'out'::character varying]::text[])),
  track_id integer,
  confidence double precision,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT vehicle_logs_pkey PRIMARY KEY (id)
);