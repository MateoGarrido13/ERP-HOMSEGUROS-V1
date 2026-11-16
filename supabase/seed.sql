-- Cuentas locales de desarrollo (SUP-1 de la épica Acceso).
-- `supabase db reset` las carga después de las migraciones (`config.toml` [db.seed]).
-- Contraseñas de ejemplo: solo local. Nunca en el proyecto alojado.

-- pgcrypto vive en `extensions` (imagen local de Supabase).
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    is_sso_user,
    is_anonymous
)
VALUES
    (
        '00000000-0000-0000-0000-000000000000',
        'a1111111-1111-4111-8111-111111111111',
        'authenticated',
        'authenticated',
        'martin.gomez@hom.com.ar',
        extensions.crypt('Martin2026', extensions.gen_salt('bf', 10)),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        now(),
        now(),
        '',
        '',
        '',
        '',
        false,
        false
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        'b2222222-2222-4222-8222-222222222222',
        'authenticated',
        'authenticated',
        'laura.rios@hom.com.ar',
        extensions.crypt('Red2026', extensions.gen_salt('bf', 10)),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        now(),
        now(),
        '',
        '',
        '',
        '',
        false,
        false
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        'c3333333-3333-4333-8333-333333333333',
        'authenticated',
        'authenticated',
        'pablo.sosa@hom.com.ar',
        extensions.crypt('Admin2026', extensions.gen_salt('bf', 10)),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{}'::jsonb,
        now(),
        now(),
        '',
        '',
        '',
        '',
        false,
        false
    );

INSERT INTO auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
)
VALUES
    (
        'a1111111-1111-4111-8111-111111111111',
        'a1111111-1111-4111-8111-111111111111',
        jsonb_build_object(
            'sub', 'a1111111-1111-4111-8111-111111111111',
            'email', 'martin.gomez@hom.com.ar'
        ),
        'email',
        now(),
        now(),
        now()
    ),
    (
        'b2222222-2222-4222-8222-222222222222',
        'b2222222-2222-4222-8222-222222222222',
        jsonb_build_object(
            'sub', 'b2222222-2222-4222-8222-222222222222',
            'email', 'laura.rios@hom.com.ar'
        ),
        'email',
        now(),
        now(),
        now()
    ),
    (
        'c3333333-3333-4333-8333-333333333333',
        'c3333333-3333-4333-8333-333333333333',
        jsonb_build_object(
            'sub', 'c3333333-3333-4333-8333-333333333333',
            'email', 'pablo.sosa@hom.com.ar'
        ),
        'email',
        now(),
        now(),
        now()
    )
    ,
    (
        'd4444444-4444-4444-8444-444444444444',
        'd4444444-4444-4444-8444-444444444444',
        jsonb_build_object(
            'sub', 'd4444444-4444-4444-8444-444444444444',
            'email', 'juan.perez@hom.com.ar',
            'name', 'Juan Perez'
        ),
        'email',
        now(),
        now(),
        now()
    );

INSERT INTO public.usuario (
    id,
    email,
    nombre,
    apellido,
    dni,
    telefono,
    rol,
    organizacion,
    estado
)
VALUES
    (
        'a1111111-1111-4111-8111-111111111111',
        'martin.gomez@hom.com.ar',
        'Martín',
        'Gómez',
        25108421,
        '11 4321-9088',
        'pas',
        'HOM Profesionales en Seguros',
        'activo'
    ),
    (
        'd4444444-4444-4444-8444-444444444444',
        'juan.perez@hom.com.ar',
        'Juan',
        'Perez',
        28108421,
        '11 4321-9088',
        'pas',
        'HOM Profesionales en Seguros',
        'activo'
    ),
    (
        'b2222222-2222-4222-8222-222222222222',
        'laura.rios@hom.com.ar',
        'Laura',
        'Ríos',
        27554213,
        '11 4321-2200',
        'directivo',
        'HOM Profesionales en Seguros',
        'activo'
    ),
    (
        'c3333333-3333-4333-8333-333333333333',
        'pablo.sosa@hom.com.ar',
        'Pablo',
        'Sosa',
        30112987,
        '11 4321-3311',
        'administrativo',
        'HOM Profesionales en Seguros',
        'activo'
    );

-- Solo el PAS es productor (PA-9): la matrícula vive acá, no en usuario.
INSERT INTO public.productor (id, matricula_ssn)
VALUES (
    'a1111111-1111-4111-8111-111111111111',
    '42108'
),
(
    'd4444444-4444-4444-8444-444444444444',
    '42109'
);
