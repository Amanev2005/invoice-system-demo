--
-- PostgreSQL database dump
--

\restrict Uk3XctpIX45yVYa1RAII74hDstMFDnfen8vCY7C0mERzVyfuFVFyKeBJhU1KQ5Q

-- Dumped from database version 18.2
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.invoices_workorderitem DROP CONSTRAINT IF EXISTS invoices_workorderit_work_order_id_72262201_fk_invoices_;
ALTER TABLE IF EXISTS ONLY public.invoices_workorder DROP CONSTRAINT IF EXISTS invoices_workorder_client_id_a7151d9c_fk_invoices_client_id;
ALTER TABLE IF EXISTS ONLY public.invoices_wallet DROP CONSTRAINT IF EXISTS invoices_wallet_client_id_3d5779eb_fk_invoices_client_id;
ALTER TABLE IF EXISTS ONLY public.invoices_transaction DROP CONSTRAINT IF EXISTS invoices_transaction_wallet_id_1804b4c2_fk_invoices_wallet_id;
ALTER TABLE IF EXISTS ONLY public.invoices_transaction DROP CONSTRAINT IF EXISTS invoices_transaction_related_payment_id_990a2693_fk_invoices_;
ALTER TABLE IF EXISTS ONLY public.invoices_transaction DROP CONSTRAINT IF EXISTS invoices_transaction_related_invoice_id_628d97e1_fk_invoices_;
ALTER TABLE IF EXISTS ONLY public.invoices_transaction DROP CONSTRAINT IF EXISTS invoices_transaction_related_expense_id_9df0a0f5_fk_invoices_;
ALTER TABLE IF EXISTS ONLY public.invoices_paymentlink DROP CONSTRAINT IF EXISTS invoices_paymentlink_invoice_id_6162ad5e_fk_invoices_invoice_id;
ALTER TABLE IF EXISTS ONLY public.invoices_payment DROP CONSTRAINT IF EXISTS invoices_payment_invoice_id_d69b2c32_fk_invoices_invoice_id;
ALTER TABLE IF EXISTS ONLY public.invoices_ledgerentry DROP CONSTRAINT IF EXISTS invoices_ledgerentry_related_payment_id_c3bf1eb2_fk_invoices_;
ALTER TABLE IF EXISTS ONLY public.invoices_ledgerentry DROP CONSTRAINT IF EXISTS invoices_ledgerentry_related_invoice_id_86cb005f_fk_invoices_;
ALTER TABLE IF EXISTS ONLY public.invoices_ledgerentry DROP CONSTRAINT IF EXISTS invoices_ledgerentry_related_credit_tx_id_4a360d59_fk_invoices_;
ALTER TABLE IF EXISTS ONLY public.invoices_ledgerentry DROP CONSTRAINT IF EXISTS invoices_ledgerentry_client_id_2320866d_fk_invoices_client_id;
ALTER TABLE IF EXISTS ONLY public.invoices_lead DROP CONSTRAINT IF EXISTS invoices_lead_converted_client_id_dc096f72_fk_invoices_;
ALTER TABLE IF EXISTS ONLY public.invoices_invoiceitem DROP CONSTRAINT IF EXISTS invoices_invoiceitem_invoice_id_5ce05433_fk_invoices_invoice_id;
ALTER TABLE IF EXISTS ONLY public.invoices_invoice DROP CONSTRAINT IF EXISTS invoices_invoice_client_id_b83ca539_fk_invoices_client_id;
ALTER TABLE IF EXISTS ONLY public.invoices_expense DROP CONSTRAINT IF EXISTS invoices_expense_wallet_id_f1c2b1ff_fk_invoices_wallet_id;
ALTER TABLE IF EXISTS ONLY public.invoices_emailhistory DROP CONSTRAINT IF EXISTS invoices_emailhistor_invoice_id_4d323784_fk_invoices_;
ALTER TABLE IF EXISTS ONLY public.invoices_document DROP CONSTRAINT IF EXISTS invoices_document_client_id_31b9b182_fk_invoices_client_id;
ALTER TABLE IF EXISTS ONLY public.invoices_credittransaction DROP CONSTRAINT IF EXISTS invoices_credittrans_client_id_6ef13507_fk_invoices_;
ALTER TABLE IF EXISTS ONLY public.invoices_commission DROP CONSTRAINT IF EXISTS invoices_commission_invoice_id_e29c9d4c_fk_invoices_invoice_id;
ALTER TABLE IF EXISTS ONLY public.django_admin_log DROP CONSTRAINT IF EXISTS django_admin_log_user_id_c564eba6_fk_auth_user_id;
ALTER TABLE IF EXISTS ONLY public.django_admin_log DROP CONSTRAINT IF EXISTS django_admin_log_content_type_id_c4bce8eb_fk_django_co;
ALTER TABLE IF EXISTS ONLY public.auth_user_user_permissions DROP CONSTRAINT IF EXISTS auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id;
ALTER TABLE IF EXISTS ONLY public.auth_user_user_permissions DROP CONSTRAINT IF EXISTS auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm;
ALTER TABLE IF EXISTS ONLY public.auth_user_groups DROP CONSTRAINT IF EXISTS auth_user_groups_user_id_6a12ed8b_fk_auth_user_id;
ALTER TABLE IF EXISTS ONLY public.auth_user_groups DROP CONSTRAINT IF EXISTS auth_user_groups_group_id_97559544_fk_auth_group_id;
ALTER TABLE IF EXISTS ONLY public.auth_permission DROP CONSTRAINT IF EXISTS auth_permission_content_type_id_2f476e4b_fk_django_co;
ALTER TABLE IF EXISTS ONLY public.auth_group_permissions DROP CONSTRAINT IF EXISTS auth_group_permissions_group_id_b120cbf9_fk_auth_group_id;
ALTER TABLE IF EXISTS ONLY public.auth_group_permissions DROP CONSTRAINT IF EXISTS auth_group_permissio_permission_id_84c5c92e_fk_auth_perm;
DROP INDEX IF EXISTS public.invoices_workorderitem_work_order_id_72262201;
DROP INDEX IF EXISTS public.invoices_workorder_work_order_number_58620d6f_like;
DROP INDEX IF EXISTS public.invoices_workorder_client_id_a7151d9c;
DROP INDEX IF EXISTS public.invoices_wallet_name_aca60adc_like;
DROP INDEX IF EXISTS public.invoices_wallet_client_id_3d5779eb;
DROP INDEX IF EXISTS public.invoices_transaction_wallet_id_1804b4c2;
DROP INDEX IF EXISTS public.invoices_transaction_related_payment_id_990a2693;
DROP INDEX IF EXISTS public.invoices_transaction_related_invoice_id_628d97e1;
DROP INDEX IF EXISTS public.invoices_transaction_related_expense_id_9df0a0f5;
DROP INDEX IF EXISTS public.invoices_service_name_13360d80_like;
DROP INDEX IF EXISTS public.invoices_paymentlink_link_code_1f0497de_like;
DROP INDEX IF EXISTS public.invoices_paymentlink_invoice_id_6162ad5e;
DROP INDEX IF EXISTS public.invoices_payment_invoice_id_d69b2c32;
DROP INDEX IF EXISTS public.invoices_ledgerentry_related_payment_id_c3bf1eb2;
DROP INDEX IF EXISTS public.invoices_ledgerentry_related_invoice_id_86cb005f;
DROP INDEX IF EXISTS public.invoices_ledgerentry_related_credit_tx_id_4a360d59;
DROP INDEX IF EXISTS public.invoices_ledgerentry_client_id_2320866d;
DROP INDEX IF EXISTS public.invoices_lead_converted_client_id_dc096f72;
DROP INDEX IF EXISTS public.invoices_invoiceitem_invoice_id_5ce05433;
DROP INDEX IF EXISTS public.invoices_invoice_invoice_number_69d5c6a9_like;
DROP INDEX IF EXISTS public.invoices_invoice_client_id_b83ca539;
DROP INDEX IF EXISTS public.invoices_expense_wallet_id_f1c2b1ff;
DROP INDEX IF EXISTS public.invoices_employee_email_6dd7b700_like;
DROP INDEX IF EXISTS public.invoices_emailhistory_invoice_id_4d323784;
DROP INDEX IF EXISTS public.invoices_document_client_id_31b9b182;
DROP INDEX IF EXISTS public.invoices_credittransaction_client_id_6ef13507;
DROP INDEX IF EXISTS public.invoices_commission_invoice_id_e29c9d4c;
DROP INDEX IF EXISTS public.invoices_client_name_e855459c_like;
DROP INDEX IF EXISTS public.django_session_session_key_c0390e0f_like;
DROP INDEX IF EXISTS public.django_session_expire_date_a5c62663;
DROP INDEX IF EXISTS public.django_admin_log_user_id_c564eba6;
DROP INDEX IF EXISTS public.django_admin_log_content_type_id_c4bce8eb;
DROP INDEX IF EXISTS public.auth_user_username_6821ab7c_like;
DROP INDEX IF EXISTS public.auth_user_user_permissions_user_id_a95ead1b;
DROP INDEX IF EXISTS public.auth_user_user_permissions_permission_id_1fbb5f2c;
DROP INDEX IF EXISTS public.auth_user_groups_user_id_6a12ed8b;
DROP INDEX IF EXISTS public.auth_user_groups_group_id_97559544;
DROP INDEX IF EXISTS public.auth_permission_content_type_id_2f476e4b;
DROP INDEX IF EXISTS public.auth_group_permissions_permission_id_84c5c92e;
DROP INDEX IF EXISTS public.auth_group_permissions_group_id_b120cbf9;
DROP INDEX IF EXISTS public.auth_group_name_a6ea08ec_like;
ALTER TABLE IF EXISTS ONLY public.invoices_workorderitem DROP CONSTRAINT IF EXISTS invoices_workorderitem_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices_workorder DROP CONSTRAINT IF EXISTS invoices_workorder_work_order_number_key;
ALTER TABLE IF EXISTS ONLY public.invoices_workorder DROP CONSTRAINT IF EXISTS invoices_workorder_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices_wallet DROP CONSTRAINT IF EXISTS invoices_wallet_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices_wallet DROP CONSTRAINT IF EXISTS invoices_wallet_name_key;
ALTER TABLE IF EXISTS ONLY public.invoices_transaction DROP CONSTRAINT IF EXISTS invoices_transaction_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices_supplier DROP CONSTRAINT IF EXISTS invoices_supplier_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices_service DROP CONSTRAINT IF EXISTS invoices_service_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices_service DROP CONSTRAINT IF EXISTS invoices_service_name_key;
ALTER TABLE IF EXISTS ONLY public.invoices_paymentlink DROP CONSTRAINT IF EXISTS invoices_paymentlink_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices_paymentlink DROP CONSTRAINT IF EXISTS invoices_paymentlink_link_code_key;
ALTER TABLE IF EXISTS ONLY public.invoices_payment DROP CONSTRAINT IF EXISTS invoices_payment_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices_ledgerentry DROP CONSTRAINT IF EXISTS invoices_ledgerentry_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices_lead DROP CONSTRAINT IF EXISTS invoices_lead_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices_invoiceitem DROP CONSTRAINT IF EXISTS invoices_invoiceitem_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices_invoice DROP CONSTRAINT IF EXISTS invoices_invoice_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices_invoice DROP CONSTRAINT IF EXISTS invoices_invoice_invoice_number_key;
ALTER TABLE IF EXISTS ONLY public.invoices_expense DROP CONSTRAINT IF EXISTS invoices_expense_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices_employee DROP CONSTRAINT IF EXISTS invoices_employee_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices_employee DROP CONSTRAINT IF EXISTS invoices_employee_email_key;
ALTER TABLE IF EXISTS ONLY public.invoices_emailhistory DROP CONSTRAINT IF EXISTS invoices_emailhistory_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices_document DROP CONSTRAINT IF EXISTS invoices_document_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices_credittransaction DROP CONSTRAINT IF EXISTS invoices_credittransaction_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices_companysettings DROP CONSTRAINT IF EXISTS invoices_companysettings_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices_commission DROP CONSTRAINT IF EXISTS invoices_commission_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices_client DROP CONSTRAINT IF EXISTS invoices_client_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices_client DROP CONSTRAINT IF EXISTS invoices_client_name_key;
ALTER TABLE IF EXISTS ONLY public.invoices_bookmark DROP CONSTRAINT IF EXISTS invoices_bookmark_pkey;
ALTER TABLE IF EXISTS ONLY public.invoices_activitylog DROP CONSTRAINT IF EXISTS invoices_activitylog_pkey;
ALTER TABLE IF EXISTS ONLY public.django_session DROP CONSTRAINT IF EXISTS django_session_pkey;
ALTER TABLE IF EXISTS ONLY public.django_migrations DROP CONSTRAINT IF EXISTS django_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.django_content_type DROP CONSTRAINT IF EXISTS django_content_type_pkey;
ALTER TABLE IF EXISTS ONLY public.django_content_type DROP CONSTRAINT IF EXISTS django_content_type_app_label_model_76bd3d3b_uniq;
ALTER TABLE IF EXISTS ONLY public.django_admin_log DROP CONSTRAINT IF EXISTS django_admin_log_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_user DROP CONSTRAINT IF EXISTS auth_user_username_key;
ALTER TABLE IF EXISTS ONLY public.auth_user_user_permissions DROP CONSTRAINT IF EXISTS auth_user_user_permissions_user_id_permission_id_14a6b632_uniq;
ALTER TABLE IF EXISTS ONLY public.auth_user_user_permissions DROP CONSTRAINT IF EXISTS auth_user_user_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_user DROP CONSTRAINT IF EXISTS auth_user_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_user_groups DROP CONSTRAINT IF EXISTS auth_user_groups_user_id_group_id_94350c0c_uniq;
ALTER TABLE IF EXISTS ONLY public.auth_user_groups DROP CONSTRAINT IF EXISTS auth_user_groups_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_permission DROP CONSTRAINT IF EXISTS auth_permission_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_permission DROP CONSTRAINT IF EXISTS auth_permission_content_type_id_codename_01ab375a_uniq;
ALTER TABLE IF EXISTS ONLY public.auth_group DROP CONSTRAINT IF EXISTS auth_group_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_group_permissions DROP CONSTRAINT IF EXISTS auth_group_permissions_pkey;
ALTER TABLE IF EXISTS ONLY public.auth_group_permissions DROP CONSTRAINT IF EXISTS auth_group_permissions_group_id_permission_id_0cd325b0_uniq;
ALTER TABLE IF EXISTS ONLY public.auth_group DROP CONSTRAINT IF EXISTS auth_group_name_key;
DROP TABLE IF EXISTS public.invoices_workorderitem;
DROP TABLE IF EXISTS public.invoices_workorder;
DROP TABLE IF EXISTS public.invoices_wallet;
DROP TABLE IF EXISTS public.invoices_transaction;
DROP TABLE IF EXISTS public.invoices_supplier;
DROP TABLE IF EXISTS public.invoices_service;
DROP TABLE IF EXISTS public.invoices_paymentlink;
DROP TABLE IF EXISTS public.invoices_payment;
DROP TABLE IF EXISTS public.invoices_ledgerentry;
DROP TABLE IF EXISTS public.invoices_lead;
DROP TABLE IF EXISTS public.invoices_invoiceitem;
DROP TABLE IF EXISTS public.invoices_invoice;
DROP TABLE IF EXISTS public.invoices_expense;
DROP TABLE IF EXISTS public.invoices_employee;
DROP TABLE IF EXISTS public.invoices_emailhistory;
DROP TABLE IF EXISTS public.invoices_document;
DROP TABLE IF EXISTS public.invoices_credittransaction;
DROP TABLE IF EXISTS public.invoices_companysettings;
DROP TABLE IF EXISTS public.invoices_commission;
DROP TABLE IF EXISTS public.invoices_client;
DROP TABLE IF EXISTS public.invoices_bookmark;
DROP TABLE IF EXISTS public.invoices_activitylog;
DROP TABLE IF EXISTS public.django_session;
DROP TABLE IF EXISTS public.django_migrations;
DROP TABLE IF EXISTS public.django_content_type;
DROP TABLE IF EXISTS public.django_admin_log;
DROP TABLE IF EXISTS public.auth_user_user_permissions;
DROP TABLE IF EXISTS public.auth_user_groups;
DROP TABLE IF EXISTS public.auth_user;
DROP TABLE IF EXISTS public.auth_permission;
DROP TABLE IF EXISTS public.auth_group_permissions;
DROP TABLE IF EXISTS public.auth_group;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: auth_group; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.auth_group (
    id integer NOT NULL,
    name character varying(150) NOT NULL
);


ALTER TABLE public.auth_group OWNER TO invoice_user;

--
-- Name: auth_group_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.auth_group ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_group_permissions; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.auth_group_permissions (
    id bigint NOT NULL,
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_group_permissions OWNER TO invoice_user;

--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.auth_group_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_group_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_permission; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.auth_permission (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    content_type_id integer NOT NULL,
    codename character varying(100) NOT NULL
);


ALTER TABLE public.auth_permission OWNER TO invoice_user;

--
-- Name: auth_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.auth_permission ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_user; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.auth_user (
    id integer NOT NULL,
    password character varying(128) NOT NULL,
    last_login timestamp with time zone,
    is_superuser boolean NOT NULL,
    username character varying(150) NOT NULL,
    first_name character varying(150) NOT NULL,
    last_name character varying(150) NOT NULL,
    email character varying(254) NOT NULL,
    is_staff boolean NOT NULL,
    is_active boolean NOT NULL,
    date_joined timestamp with time zone NOT NULL
);


ALTER TABLE public.auth_user OWNER TO invoice_user;

--
-- Name: auth_user_groups; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.auth_user_groups (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE public.auth_user_groups OWNER TO invoice_user;

--
-- Name: auth_user_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.auth_user_groups ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_user_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_user_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.auth_user ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: auth_user_user_permissions; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.auth_user_user_permissions (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_user_user_permissions OWNER TO invoice_user;

--
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.auth_user_user_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_user_user_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_admin_log; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.django_admin_log (
    id integer NOT NULL,
    action_time timestamp with time zone NOT NULL,
    object_id text,
    object_repr character varying(200) NOT NULL,
    action_flag smallint NOT NULL,
    change_message text NOT NULL,
    content_type_id integer,
    user_id integer NOT NULL,
    CONSTRAINT django_admin_log_action_flag_check CHECK ((action_flag >= 0))
);


ALTER TABLE public.django_admin_log OWNER TO invoice_user;

--
-- Name: django_admin_log_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.django_admin_log ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_admin_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_content_type; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.django_content_type (
    id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);


ALTER TABLE public.django_content_type OWNER TO invoice_user;

--
-- Name: django_content_type_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.django_content_type ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_content_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_migrations; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.django_migrations (
    id bigint NOT NULL,
    app character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    applied timestamp with time zone NOT NULL
);


ALTER TABLE public.django_migrations OWNER TO invoice_user;

--
-- Name: django_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.django_migrations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: django_session; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.django_session (
    session_key character varying(40) NOT NULL,
    session_data text NOT NULL,
    expire_date timestamp with time zone NOT NULL
);


ALTER TABLE public.django_session OWNER TO invoice_user;

--
-- Name: invoices_activitylog; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_activitylog (
    id bigint NOT NULL,
    action character varying(20) NOT NULL,
    model_name character varying(100) NOT NULL,
    object_id integer,
    description text NOT NULL,
    ip_address inet,
    "timestamp" timestamp with time zone NOT NULL
);


ALTER TABLE public.invoices_activitylog OWNER TO invoice_user;

--
-- Name: invoices_activitylog_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_activitylog ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_activitylog_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices_bookmark; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_bookmark (
    id bigint NOT NULL,
    bookmark_type character varying(20) NOT NULL,
    object_id integer NOT NULL,
    title character varying(255) NOT NULL,
    notes text NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.invoices_bookmark OWNER TO invoice_user;

--
-- Name: invoices_bookmark_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_bookmark ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_bookmark_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices_client; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_client (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(254) NOT NULL,
    phone character varying(50) NOT NULL,
    address text NOT NULL,
    credit_limit numeric(10,2) NOT NULL,
    credit_terms integer NOT NULL,
    current_balance numeric(10,2) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    advance_balance numeric(12,2) NOT NULL,
    credit_balance numeric(12,2) NOT NULL,
    debit_balance numeric(12,2) NOT NULL,
    trn_no character varying(100) NOT NULL,
    vat_no character varying(100) NOT NULL
);


ALTER TABLE public.invoices_client OWNER TO invoice_user;

--
-- Name: invoices_client_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_client ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_client_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices_commission; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_commission (
    id bigint NOT NULL,
    commission_to character varying(100) NOT NULL,
    amount numeric(10,2) NOT NULL,
    is_paid boolean NOT NULL,
    payment_date date,
    date date NOT NULL,
    created_at timestamp with time zone NOT NULL,
    invoice_id bigint NOT NULL
);


ALTER TABLE public.invoices_commission OWNER TO invoice_user;

--
-- Name: invoices_commission_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_commission ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_commission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices_companysettings; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_companysettings (
    id bigint NOT NULL,
    company_name character varying(255) NOT NULL,
    company_email character varying(254) NOT NULL,
    company_mobile character varying(50) NOT NULL,
    company_phone character varying(50) NOT NULL,
    company_po_box character varying(50) NOT NULL,
    company_address character varying(255) NOT NULL,
    logo character varying(100),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    aging_period_1 integer NOT NULL,
    aging_period_2 integer NOT NULL,
    aging_period_3 integer NOT NULL,
    default_credit_terms integer NOT NULL,
    soa_notes text NOT NULL,
    about_company text NOT NULL,
    company_email_password character varying(255) NOT NULL,
    auto_backup_times character varying(255) NOT NULL,
    enable_auto_backup boolean NOT NULL
);


ALTER TABLE public.invoices_companysettings OWNER TO invoice_user;

--
-- Name: invoices_companysettings_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_companysettings ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_companysettings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices_credittransaction; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_credittransaction (
    id bigint NOT NULL,
    transaction_type character varying(10) NOT NULL,
    amount numeric(12,2) NOT NULL,
    date timestamp with time zone NOT NULL,
    is_advance boolean NOT NULL,
    payment_method character varying(100) NOT NULL,
    remarks text NOT NULL,
    settle_amount numeric(12,2) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    client_id bigint NOT NULL
);


ALTER TABLE public.invoices_credittransaction OWNER TO invoice_user;

--
-- Name: invoices_credittransaction_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_credittransaction ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_credittransaction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices_document; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_document (
    id bigint NOT NULL,
    title character varying(255) NOT NULL,
    file character varying(100) NOT NULL,
    category character varying(50) NOT NULL,
    description text NOT NULL,
    file_size integer NOT NULL,
    uploaded_at timestamp with time zone NOT NULL,
    client_id bigint
);


ALTER TABLE public.invoices_document OWNER TO invoice_user;

--
-- Name: invoices_document_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_document ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_document_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices_emailhistory; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_emailhistory (
    id bigint NOT NULL,
    recipient_email character varying(254) NOT NULL,
    status character varying(20) NOT NULL,
    error_message text,
    sent_at timestamp with time zone NOT NULL,
    invoice_id bigint NOT NULL,
    sent_by character varying(150) NOT NULL
);


ALTER TABLE public.invoices_emailhistory OWNER TO invoice_user;

--
-- Name: invoices_emailhistory_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_emailhistory ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_emailhistory_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices_employee; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_employee (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(254) NOT NULL,
    role character varying(100) NOT NULL,
    department character varying(100) NOT NULL,
    status character varying(20) NOT NULL,
    join_date date NOT NULL,
    permissions jsonb NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.invoices_employee OWNER TO invoice_user;

--
-- Name: invoices_employee_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_employee ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_employee_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices_expense; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_expense (
    id bigint NOT NULL,
    description character varying(255) NOT NULL,
    amount numeric(10,2) NOT NULL,
    category character varying(100) NOT NULL,
    date date NOT NULL,
    notes text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    wallet_id bigint
);


ALTER TABLE public.invoices_expense OWNER TO invoice_user;

--
-- Name: invoices_expense_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_expense ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_expense_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices_invoice; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_invoice (
    id bigint NOT NULL,
    company_name character varying(255) NOT NULL,
    company_email character varying(254) NOT NULL,
    company_mobile character varying(50) NOT NULL,
    company_phone character varying(50) NOT NULL,
    company_po_box character varying(50) NOT NULL,
    company_address character varying(255) NOT NULL,
    invoice_number character varying(20) NOT NULL,
    invoice_date date NOT NULL,
    client_name character varying(255) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    total_in_words character varying(500) NOT NULL,
    payment_method character varying(100) NOT NULL,
    notes text NOT NULL,
    status character varying(20) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    amount_paid numeric(10,2) NOT NULL,
    due_date date,
    client_id bigint
);


ALTER TABLE public.invoices_invoice OWNER TO invoice_user;

--
-- Name: invoices_invoice_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_invoice ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_invoice_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices_invoiceitem; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_invoiceitem (
    id bigint NOT NULL,
    description character varying(255) NOT NULL,
    quantity integer NOT NULL,
    rate numeric(10,2) NOT NULL,
    amount numeric(10,2) NOT NULL,
    invoice_id bigint NOT NULL,
    card_payment numeric(10,2) NOT NULL,
    payment_done boolean NOT NULL
);


ALTER TABLE public.invoices_invoiceitem OWNER TO invoice_user;

--
-- Name: invoices_invoiceitem_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_invoiceitem ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_invoiceitem_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices_lead; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_lead (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(254) NOT NULL,
    phone character varying(50) NOT NULL,
    company character varying(255) NOT NULL,
    source character varying(50) NOT NULL,
    status character varying(50) NOT NULL,
    notes text NOT NULL,
    estimated_value numeric(10,2) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    converted_client_id bigint
);


ALTER TABLE public.invoices_lead OWNER TO invoice_user;

--
-- Name: invoices_lead_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_lead ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_lead_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices_ledgerentry; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_ledgerentry (
    id bigint NOT NULL,
    entry_type character varying(20) NOT NULL,
    reference character varying(100) NOT NULL,
    debit numeric(12,2) NOT NULL,
    credit numeric(12,2) NOT NULL,
    running_balance numeric(12,2) NOT NULL,
    date date NOT NULL,
    notes text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    client_id bigint NOT NULL,
    related_credit_tx_id bigint,
    related_invoice_id bigint,
    related_payment_id bigint
);


ALTER TABLE public.invoices_ledgerentry OWNER TO invoice_user;

--
-- Name: invoices_ledgerentry_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_ledgerentry ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_ledgerentry_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices_payment; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_payment (
    id bigint NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_date date NOT NULL,
    payment_method character varying(20) NOT NULL,
    reference_number character varying(100) NOT NULL,
    notes text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    created_by character varying(100) NOT NULL,
    invoice_id bigint NOT NULL
);


ALTER TABLE public.invoices_payment OWNER TO invoice_user;

--
-- Name: invoices_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_payment ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_payment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices_paymentlink; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_paymentlink (
    id bigint NOT NULL,
    link_code character varying(50) NOT NULL,
    amount numeric(10,2) NOT NULL,
    status character varying(20) NOT NULL,
    expires_at timestamp with time zone,
    paid_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    invoice_id bigint NOT NULL
);


ALTER TABLE public.invoices_paymentlink OWNER TO invoice_user;

--
-- Name: invoices_paymentlink_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_paymentlink ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_paymentlink_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices_service; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_service (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    description text NOT NULL,
    default_price numeric(10,2) NOT NULL,
    category character varying(50) NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.invoices_service OWNER TO invoice_user;

--
-- Name: invoices_service_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_service ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_service_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices_supplier; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_supplier (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(254) NOT NULL,
    phone character varying(50) NOT NULL,
    address text NOT NULL,
    category character varying(100) NOT NULL,
    balance numeric(12,2) NOT NULL,
    status character varying(20) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.invoices_supplier OWNER TO invoice_user;

--
-- Name: invoices_supplier_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_supplier ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_supplier_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices_transaction; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_transaction (
    id bigint NOT NULL,
    transaction_type character varying(20) NOT NULL,
    amount numeric(12,2) NOT NULL,
    category character varying(50) NOT NULL,
    description text NOT NULL,
    date date NOT NULL,
    reference_number character varying(100) NOT NULL,
    notes text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    related_expense_id bigint,
    related_invoice_id bigint,
    related_payment_id bigint,
    wallet_id bigint
);


ALTER TABLE public.invoices_transaction OWNER TO invoice_user;

--
-- Name: invoices_transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_transaction ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_transaction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices_wallet; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_wallet (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    balance numeric(12,2) NOT NULL,
    wallet_type character varying(50) NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    client_id bigint,
    bank_name character varying(100) NOT NULL
);


ALTER TABLE public.invoices_wallet OWNER TO invoice_user;

--
-- Name: invoices_wallet_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_wallet ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_wallet_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices_workorder; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_workorder (
    id bigint NOT NULL,
    work_order_number character varying(50) NOT NULL,
    status character varying(20) NOT NULL,
    count integer NOT NULL,
    total_count integer NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    client_id bigint NOT NULL,
    notes text NOT NULL,
    payment_method character varying(100) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    due_date date,
    start_date date NOT NULL
);


ALTER TABLE public.invoices_workorder OWNER TO invoice_user;

--
-- Name: invoices_workorder_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_workorder ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_workorder_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: invoices_workorderitem; Type: TABLE; Schema: public; Owner: invoice_user
--

CREATE TABLE public.invoices_workorderitem (
    id bigint NOT NULL,
    description character varying(255) NOT NULL,
    quantity integer NOT NULL,
    rate numeric(10,2) NOT NULL,
    amount numeric(10,2) NOT NULL,
    work_order_id bigint NOT NULL
);


ALTER TABLE public.invoices_workorderitem OWNER TO invoice_user;

--
-- Name: invoices_workorderitem_id_seq; Type: SEQUENCE; Schema: public; Owner: invoice_user
--

ALTER TABLE public.invoices_workorderitem ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.invoices_workorderitem_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: auth_group; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.auth_group (id, name) FROM stdin;
\.


--
-- Data for Name: auth_group_permissions; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.auth_group_permissions (id, group_id, permission_id) FROM stdin;
\.


--
-- Data for Name: auth_permission; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.auth_permission (id, name, content_type_id, codename) FROM stdin;
1	Can add log entry	1	add_logentry
2	Can change log entry	1	change_logentry
3	Can delete log entry	1	delete_logentry
4	Can view log entry	1	view_logentry
5	Can add permission	3	add_permission
6	Can change permission	3	change_permission
7	Can delete permission	3	delete_permission
8	Can view permission	3	view_permission
9	Can add group	2	add_group
10	Can change group	2	change_group
11	Can delete group	2	delete_group
12	Can view group	2	view_group
13	Can add user	4	add_user
14	Can change user	4	change_user
15	Can delete user	4	delete_user
16	Can view user	4	view_user
17	Can add content type	5	add_contenttype
18	Can change content type	5	change_contenttype
19	Can delete content type	5	delete_contenttype
20	Can view content type	5	view_contenttype
21	Can add session	6	add_session
22	Can change session	6	change_session
23	Can delete session	6	delete_session
24	Can view session	6	view_session
25	Can add invoice	17	add_invoice
26	Can change invoice	17	change_invoice
27	Can delete invoice	17	delete_invoice
28	Can view invoice	17	view_invoice
29	Can add invoice item	18	add_invoiceitem
30	Can change invoice item	18	change_invoiceitem
31	Can delete invoice item	18	delete_invoiceitem
32	Can view invoice item	18	view_invoiceitem
33	Can add Company Settings	11	add_companysettings
34	Can change Company Settings	11	change_companysettings
35	Can delete Company Settings	11	delete_companysettings
36	Can view Company Settings	11	view_companysettings
37	Can add email history	14	add_emailhistory
38	Can change email history	14	change_emailhistory
39	Can delete email history	14	delete_emailhistory
40	Can view email history	14	view_emailhistory
41	Can add client	9	add_client
42	Can change client	9	change_client
43	Can delete client	9	delete_client
44	Can view client	9	view_client
45	Can add payment	20	add_payment
46	Can change payment	20	change_payment
47	Can delete payment	20	delete_payment
48	Can view payment	20	view_payment
49	Can add wallet	25	add_wallet
50	Can change wallet	25	change_wallet
51	Can delete wallet	25	delete_wallet
52	Can view wallet	25	view_wallet
53	Can add commission	10	add_commission
54	Can change commission	10	change_commission
55	Can delete commission	10	delete_commission
56	Can view commission	10	view_commission
57	Can add credit transaction	12	add_credittransaction
58	Can change credit transaction	12	change_credittransaction
59	Can delete credit transaction	12	delete_credittransaction
60	Can view credit transaction	12	view_credittransaction
61	Can add expense	16	add_expense
62	Can change expense	16	change_expense
63	Can delete expense	16	delete_expense
64	Can view expense	16	view_expense
65	Can add work order	26	add_workorder
66	Can change work order	26	change_workorder
67	Can delete work order	26	delete_workorder
68	Can view work order	26	view_workorder
69	Can add activity log	7	add_activitylog
70	Can change activity log	7	change_activitylog
71	Can delete activity log	7	delete_activitylog
72	Can view activity log	7	view_activitylog
73	Can add bookmark	8	add_bookmark
74	Can change bookmark	8	change_bookmark
75	Can delete bookmark	8	delete_bookmark
76	Can view bookmark	8	view_bookmark
77	Can add service	22	add_service
78	Can change service	22	change_service
79	Can delete service	22	delete_service
80	Can view service	22	view_service
81	Can add document	13	add_document
82	Can change document	13	change_document
83	Can delete document	13	delete_document
84	Can view document	13	view_document
85	Can add lead	19	add_lead
86	Can change lead	19	change_lead
87	Can delete lead	19	delete_lead
88	Can view lead	19	view_lead
89	Can add payment link	21	add_paymentlink
90	Can change payment link	21	change_paymentlink
91	Can delete payment link	21	delete_paymentlink
92	Can view payment link	21	view_paymentlink
93	Can add transaction	24	add_transaction
94	Can change transaction	24	change_transaction
95	Can delete transaction	24	delete_transaction
96	Can view transaction	24	view_transaction
97	Can add employee	15	add_employee
98	Can change employee	15	change_employee
99	Can delete employee	15	delete_employee
100	Can view employee	15	view_employee
101	Can add supplier	23	add_supplier
102	Can change supplier	23	change_supplier
103	Can delete supplier	23	delete_supplier
104	Can view supplier	23	view_supplier
105	Can add work order item	27	add_workorderitem
106	Can change work order item	27	change_workorderitem
107	Can delete work order item	27	delete_workorderitem
108	Can view work order item	27	view_workorderitem
109	Can add ledger entry	28	add_ledgerentry
110	Can change ledger entry	28	change_ledgerentry
111	Can delete ledger entry	28	delete_ledgerentry
112	Can view ledger entry	28	view_ledgerentry
\.


--
-- Data for Name: auth_user; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.auth_user (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) FROM stdin;
1	pbkdf2_sha256$870000$gfkrKLsBkzRVlMUg0I81DW$ACE/g2KzwzlpkPG+SEgQuZFF8u+aH+DNy2ZcB9Ac/4U=	\N	t	admin			admin@invoicesystem.local	t	t	2026-02-14 19:51:45.048669+05:30
\.


--
-- Data for Name: auth_user_groups; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.auth_user_groups (id, user_id, group_id) FROM stdin;
\.


--
-- Data for Name: auth_user_user_permissions; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.auth_user_user_permissions (id, user_id, permission_id) FROM stdin;
\.


--
-- Data for Name: django_admin_log; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.django_admin_log (id, action_time, object_id, object_repr, action_flag, change_message, content_type_id, user_id) FROM stdin;
\.


--
-- Data for Name: django_content_type; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.django_content_type (id, app_label, model) FROM stdin;
1	admin	logentry
2	auth	group
3	auth	permission
4	auth	user
5	contenttypes	contenttype
6	sessions	session
7	invoices	activitylog
8	invoices	bookmark
9	invoices	client
10	invoices	commission
11	invoices	companysettings
12	invoices	credittransaction
13	invoices	document
14	invoices	emailhistory
15	invoices	employee
16	invoices	expense
17	invoices	invoice
18	invoices	invoiceitem
19	invoices	lead
20	invoices	payment
21	invoices	paymentlink
22	invoices	service
23	invoices	supplier
24	invoices	transaction
25	invoices	wallet
26	invoices	workorder
27	invoices	workorderitem
28	invoices	ledgerentry
\.


--
-- Data for Name: django_migrations; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.django_migrations (id, app, name, applied) FROM stdin;
1	contenttypes	0001_initial	2026-02-13 19:49:14.643022+05:30
2	auth	0001_initial	2026-02-13 19:49:14.724021+05:30
3	admin	0001_initial	2026-02-13 19:49:14.747797+05:30
4	admin	0002_logentry_remove_auto_add	2026-02-13 19:49:14.757318+05:30
5	admin	0003_logentry_add_action_flag_choices	2026-02-13 19:49:14.763499+05:30
6	contenttypes	0002_remove_content_type_name	2026-02-13 19:49:14.777716+05:30
7	auth	0002_alter_permission_name_max_length	2026-02-13 19:49:14.785864+05:30
8	auth	0003_alter_user_email_max_length	2026-02-13 19:49:14.794679+05:30
9	auth	0004_alter_user_username_opts	2026-02-13 19:49:14.801567+05:30
10	auth	0005_alter_user_last_login_null	2026-02-13 19:49:14.810466+05:30
11	auth	0006_require_contenttypes_0002	2026-02-13 19:49:14.811486+05:30
12	auth	0007_alter_validators_add_error_messages	2026-02-13 19:49:14.81653+05:30
13	auth	0008_alter_user_username_max_length	2026-02-13 19:49:14.827482+05:30
14	auth	0009_alter_user_last_name_max_length	2026-02-13 19:49:14.833457+05:30
15	auth	0010_alter_group_name_max_length	2026-02-13 19:49:14.841626+05:30
16	auth	0011_update_proxy_permissions	2026-02-13 19:49:14.846427+05:30
17	auth	0012_alter_user_first_name_max_length	2026-02-13 19:49:14.852504+05:30
18	invoices	0001_initial	2026-02-13 19:49:14.876248+05:30
19	invoices	0002_companysettings	2026-02-13 19:49:14.883754+05:30
20	invoices	0003_alter_invoice_invoice_number_emailhistory	2026-02-13 19:49:14.900802+05:30
21	invoices	0004_client_invoice_amount_paid_invoice_due_date_and_more	2026-02-13 19:49:14.944562+05:30
22	invoices	0005_companysettings_aging_period_1_and_more	2026-02-13 19:49:14.957158+05:30
23	invoices	0006_companysettings_about_company	2026-02-13 19:49:14.96116+05:30
24	invoices	0007_emailhistory_sent_by	2026-02-13 19:49:14.965995+05:30
25	invoices	0008_companysettings_company_email_password	2026-02-13 19:49:14.969874+05:30
26	invoices	0009_wallet_client_advance_balance_client_credit_balance_and_more	2026-02-13 19:49:15.046923+05:30
27	invoices	0010_activitylog_bookmark_service_document_lead_and_more	2026-02-13 19:49:15.162258+05:30
28	invoices	0011_alter_expense_category_alter_invoice_status	2026-02-13 19:49:15.178017+05:30
29	invoices	0012_employee_supplier_alter_activitylog_options_and_more	2026-02-13 19:49:15.21306+05:30
30	invoices	0013_wallet_client	2026-02-13 19:49:15.227368+05:30
31	sessions	0001_initial	2026-02-13 19:49:15.237492+05:30
32	invoices	0014_workorder_notes_workorder_payment_method_and_more	2026-02-14 20:22:36.612614+05:30
33	invoices	0015_fix_activitylog_supplier_fields	2026-02-22 15:40:07.769582+05:30
34	invoices	0016_alter_supplier_options	2026-02-22 17:06:52.432578+05:30
35	invoices	0017_add_ledger_entry	2026-02-22 18:32:59.008076+05:30
36	invoices	0018_companysettings_auto_backup_times_and_more	2026-04-11 21:58:11.739853+05:30
37	invoices	0019_alter_companysettings_auto_backup_times_and_more	2026-04-11 23:32:49.566504+05:30
38	invoices	0020_workorder_due_date_workorder_start_date	2026-04-12 13:19:26.711386+05:30
39	invoices	0021_add_trn_vat_cardpmt_paymentdone_bankname	2026-04-13 17:09:20.688054+05:30
\.


--
-- Data for Name: django_session; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.django_session (session_key, session_data, expire_date) FROM stdin;
\.


--
-- Data for Name: invoices_activitylog; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_activitylog (id, action, model_name, object_id, description, ip_address, "timestamp") FROM stdin;
1	create	Client	2	Created client Salwa ev	127.0.0.1	2026-02-22 16:04:28.179052+05:30
2	create	Client	4	Created client Aman Ev	127.0.0.1	2026-02-22 19:18:34.577352+05:30
3	create	Invoice	3	Created invoice INV-0001 for client dasda	127.0.0.1	2026-02-22 19:22:57.011626+05:30
4	create	Invoice	4	Created invoice INV-0002 for client Aman Ev	127.0.0.1	2026-04-11 17:57:23.74654+05:30
5	email	Invoice	4	Sent invoice INV-0002 to amanev100@gmail.com - Success	127.0.0.1	2026-04-11 19:05:47.150592+05:30
6	create	Payment	3	Recorded payment of 19.99 for invoice INV-0002	127.0.0.1	2026-04-11 21:07:04.755009+05:30
7	create	Payment	4	Recorded payment of 9.96 for invoice INV-0002	127.0.0.1	2026-04-11 21:07:19.694685+05:30
8	create	Invoice	5	Created invoice INV-0003 for client Salwa ev	127.0.0.1	2026-04-11 21:18:39.12723+05:30
9	email	Invoice	5	Sent invoice INV-0003 to hannadahmd@gmail.com - Success	127.0.0.1	2026-04-11 21:20:35.357026+05:30
10	create	Payment	5	Recorded payment of 110.00 for invoice INV-0003	127.0.0.1	2026-04-12 17:19:32.805684+05:30
11	create	Client	5	Created client ammann	127.0.0.1	2026-04-12 18:59:35.528463+05:30
12	create	Invoice	6	Created invoice INV-0004 for client ammann	127.0.0.1	2026-04-12 19:01:35.907035+05:30
13	delete	Invoice	5	Deleted invoice INV-0003 for client Salwa ev	127.0.0.1	2026-04-12 19:25:09.001269+05:30
14	delete	Invoice	3	Deleted invoice INV-0001 for client dasda	127.0.0.1	2026-04-12 19:25:13.25131+05:30
15	delete	Invoice	4	Deleted invoice INV-0002 for client Aman Ev	127.0.0.1	2026-04-12 19:25:16.71801+05:30
16	create	Client	6	Created client wafi	127.0.0.1	2026-04-12 21:47:44.799606+05:30
17	create	Invoice	7	Created invoice INV-0005 for client Aman Ev	127.0.0.1	2026-04-12 21:50:14.264053+05:30
18	create	Payment	6	Recorded payment of 30.00 for invoice INV-0005	127.0.0.1	2026-04-12 21:50:14.297469+05:30
19	email	Invoice	7	Sent invoice INV-0005 to nibrasev10@gmail.com - Success	127.0.0.1	2026-04-12 21:50:53.969353+05:30
20	create	Invoice	8	Created invoice INV-0006 for client wafi	127.0.0.1	2026-04-12 21:53:09.717583+05:30
21	delete	Invoice	7	Deleted invoice INV-0005 for client Aman Ev	127.0.0.1	2026-04-12 21:53:59.156106+05:30
22	delete	Invoice	8	Deleted invoice INV-0006 for client wafi	127.0.0.1	2026-04-12 22:12:10.163069+05:30
23	delete	Invoice	6	Deleted invoice INV-0004 for client ammann	127.0.0.1	2026-04-12 22:12:12.781905+05:30
24	create	Invoice	9	Created invoice INV-0001 for client wafi	127.0.0.1	2026-04-12 22:16:57.794035+05:30
25	create	Client	7	Created client Waffiya	127.0.0.1	2026-04-13 17:12:25.725177+05:30
26	create	Invoice	10	Created invoice INV-0002 for client Waffiya	127.0.0.1	2026-04-13 17:13:16.581591+05:30
27	delete	Client	5	Deleted client ammann (Force: True)	127.0.0.1	2026-04-13 18:15:43.152613+05:30
28	delete	Client	4	Deleted client Aman Ev (Force: True)	127.0.0.1	2026-04-13 18:15:51.198093+05:30
29	delete	Client	2	Deleted client Salwa ev (Force: True)	127.0.0.1	2026-04-13 18:16:00.67069+05:30
30	delete	Client	6	Deleted client wafi (Force: True)	127.0.0.1	2026-04-13 18:16:12.276254+05:30
31	delete	Client	7	Deleted client Waffiya (Force: True)	127.0.0.1	2026-04-13 18:16:17.414185+05:30
32	create	Client	8	Created client Aman	127.0.0.1	2026-04-13 18:17:08.657181+05:30
33	create	Invoice	14	Created invoice INV-0004 for client Aman	127.0.0.1	2026-04-13 18:36:29.587706+05:30
34	delete	Client	8	Deleted client Aman (Force: True)	127.0.0.1	2026-04-13 18:38:10.277738+05:30
35	create	Client	9	Created client AEV	127.0.0.1	2026-04-13 18:38:47.810024+05:30
36	create	Invoice	15	Created invoice INV-0001 for client AEV	127.0.0.1	2026-04-13 18:38:55.765642+05:30
37	create	Invoice	16	Created invoice INV-0002 for client AEV	127.0.0.1	2026-04-13 18:41:52.768172+05:30
38	delete	Client	9	Deleted client AEV (Force: True)	127.0.0.1	2026-04-14 18:37:48.822164+05:30
39	create	Client	11	Created client Aman Ev	127.0.0.1	2026-04-14 18:38:33.140616+05:30
40	create	Invoice	18	Created invoice INV-0001 for client Aman Ev	127.0.0.1	2026-04-14 18:39:06.99411+05:30
41	create	Invoice	19	Created invoice INV-0002 for client Aman Ev	127.0.0.1	2026-04-14 18:40:38.906516+05:30
42	create	Payment	7	Recorded payment of 9.99 for invoice INV-0001	127.0.0.1	2026-04-14 18:48:47.865359+05:30
43	create	Invoice	20	Created invoice INV-0003 for client Aman Ev	127.0.0.1	2026-04-14 19:41:37.463359+05:30
44	create	Payment	8	Recorded payment of 100.00 for invoice INV-0003	127.0.0.1	2026-04-14 19:41:37.494789+05:30
45	create	Invoice	21	Created invoice INV-0004 for client Aman Ev	127.0.0.1	2026-04-14 19:42:56.54154+05:30
46	create	Invoice	22	Created invoice INV-0005 for client Aman Ev	127.0.0.1	2026-04-14 19:44:46.805804+05:30
47	delete	Payment	7	Deleted payment of 9.99 for invoice INV-0001	127.0.0.1	2026-04-15 16:59:55.46474+05:30
48	delete	Client	11	Deleted client Aman Ev (Force: True)	127.0.0.1	2026-04-15 17:03:01.085811+05:30
49	create	Client	12	Created client aman	127.0.0.1	2026-04-15 17:03:24.213423+05:30
50	create	Client	13	Created client amaneev	127.0.0.1	2026-04-15 17:04:17.459884+05:30
51	create	Invoice	23	Created invoice INV-0001 for client amaneev	127.0.0.1	2026-04-15 17:04:40.848944+05:30
52	create	Invoice	24	Created invoice INV-0002 for client amaneev	127.0.0.1	2026-04-15 17:05:20.888045+05:30
53	create	Invoice	25	Created invoice INV-0003 for client amaneev	127.0.0.1	2026-04-15 17:27:39.924081+05:30
54	create	Payment	9	Recorded payment of 100.00 for invoice INV-0002	127.0.0.1	2026-04-15 17:28:34.541479+05:30
55	create	Invoice	26	Created invoice INV-0004 for client amaneev	127.0.0.1	2026-04-15 17:42:54.121355+05:30
56	update	Invoice	26	Updated invoice INV-0004 for client amaneev	127.0.0.1	2026-04-15 17:43:16.083052+05:30
57	create	Invoice	27	Created invoice INV-0005 for client amaneev	127.0.0.1	2026-04-15 17:43:41.084646+05:30
58	create	Invoice	28	Created invoice INV-0006 for client amaneev	127.0.0.1	2026-04-15 17:50:09.909486+05:30
59	delete	Client	13	Deleted client amaneev (Force: True)	127.0.0.1	2026-04-15 17:51:37.290169+05:30
60	update	Client	12	Updated client aman	127.0.0.1	2026-04-15 17:51:46.181928+05:30
61	create	Invoice	29	Created invoice INV-0001 for client aman	127.0.0.1	2026-04-15 17:52:04.032284+05:30
62	create	Invoice	30	Created invoice INV-0002 for client aman	127.0.0.1	2026-04-15 17:52:30.101651+05:30
63	create	Invoice	31	Created invoice INV-0003 for client aman	127.0.0.1	2026-04-15 17:53:32.60558+05:30
64	update	Invoice	30	Updated invoice INV-0002 for client aman	127.0.0.1	2026-04-15 17:58:22.06673+05:30
65	update	Invoice	31	Updated invoice INV-0003 for client aman	127.0.0.1	2026-04-15 18:01:28.523182+05:30
66	create	Client	14	Created client sd sda	127.0.0.1	2026-04-15 18:01:57.354522+05:30
67	create	Invoice	32	Created invoice INV-0004 for client sd sda	127.0.0.1	2026-04-15 18:02:01.305265+05:30
68	update	Invoice	32	Updated invoice INV-0004 for client sd sda	127.0.0.1	2026-04-15 18:06:19.140887+05:30
69	create	Payment	10	Recorded payment of 300.00 for invoice INV-0004	127.0.0.1	2026-04-17 10:59:28.331214+05:30
70	delete	Client	14	Deleted client sd sda (Force: True)	127.0.0.1	2026-04-18 10:57:43.54226+05:30
71	delete	Client	12	Deleted client aman (Force: True)	127.0.0.1	2026-04-18 10:57:47.68843+05:30
72	create	Client	15	Created client Aman	127.0.0.1	2026-04-18 10:58:16.635415+05:30
73	create	Invoice	33	Created invoice INV-0001 for client Aman	127.0.0.1	2026-04-18 10:58:36.442322+05:30
74	update	Invoice	33	Updated invoice INV-0001 for client Aman	127.0.0.1	2026-04-18 10:59:13.601461+05:30
75	update	Invoice	33	Updated invoice INV-0001 for client Aman	127.0.0.1	2026-04-18 11:00:01.623296+05:30
76	update	Invoice	33	Updated invoice INV-0001 for client Aman	127.0.0.1	2026-04-18 11:00:17.470219+05:30
77	create	Payment	11	Recorded payment of 100.00 for invoice INV-0001	127.0.0.1	2026-04-18 11:27:40.073351+05:30
78	create	Invoice	34	Created invoice INV-0002 for client Aman	127.0.0.1	2026-04-18 11:28:47.746468+05:30
79	create	Payment	12	Recorded payment of 50.00 for invoice INV-0002	127.0.0.1	2026-04-18 11:28:48.646472+05:30
\.


--
-- Data for Name: invoices_bookmark; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_bookmark (id, bookmark_type, object_id, title, notes, created_at) FROM stdin;
\.


--
-- Data for Name: invoices_client; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_client (id, name, email, phone, address, credit_limit, credit_terms, current_balance, created_at, updated_at, advance_balance, credit_balance, debit_balance, trn_no, vat_no) FROM stdin;
12	aman	amanev100@gmail.com	8590933821	sajfa	3000.00	0	0.00	2026-04-15 17:03:24.196801+05:30	2026-04-15 17:51:46.177487+05:30	0.00	0.00	0.00	13124	
14	sd sda	amanev100@gmail.com	8249893	nzksd	30000000.00	30	0.00	2026-04-15 18:01:57.338371+05:30	2026-04-15 18:01:57.338384+05:30	0.00	0.00	0.00	242	
15	Aman	amanev100@gmail.com	8590515712	sfsdfs	3000.00	2	0.00	2026-04-18 10:58:16.631979+05:30	2026-04-18 10:58:16.631987+05:30	0.00	0.00	0.00	2213	
\.


--
-- Data for Name: invoices_commission; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_commission (id, commission_to, amount, is_paid, payment_date, date, created_at, invoice_id) FROM stdin;
\.


--
-- Data for Name: invoices_companysettings; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_companysettings (id, company_name, company_email, company_mobile, company_phone, company_po_box, company_address, logo, created_at, updated_at, aging_period_1, aging_period_2, aging_period_3, default_credit_terms, soa_notes, about_company, company_email_password, auto_backup_times, enable_auto_backup) FROM stdin;
1	Rashid Typing & Document Clearing	amanev100@gmail.com	050-7441282	06-7670165	P.o Box: 7647	Opp. Tasheel, Salama, U.A.Q - UAE	company_logos/logo_RT_YQgUEgk.jpeg	2026-02-13 19:54:22.989206+05:30	2026-04-12 19:27:03.553126+05:30	30	60	90	30			xxcl ygpg ftim fadg	02:00, 06:00, 14:00, 18:00	t
\.


--
-- Data for Name: invoices_credittransaction; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_credittransaction (id, transaction_type, amount, date, is_advance, payment_method, remarks, settle_amount, created_at, client_id) FROM stdin;
\.


--
-- Data for Name: invoices_document; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_document (id, title, file, category, description, file_size, uploaded_at, client_id) FROM stdin;
\.


--
-- Data for Name: invoices_emailhistory; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_emailhistory (id, recipient_email, status, error_message, sent_at, invoice_id, sent_by) FROM stdin;
\.


--
-- Data for Name: invoices_employee; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_employee (id, name, email, role, department, status, join_date, permissions, created_at, updated_at) FROM stdin;
1	Aman	amanev100@gmail.com	Staff	Sales	active	2026-04-13	[]	2026-04-13 17:55:54.015908+05:30	2026-04-13 17:55:54.016712+05:30
\.


--
-- Data for Name: invoices_expense; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_expense (id, description, amount, category, date, notes, created_at, wallet_id) FROM stdin;
\.


--
-- Data for Name: invoices_invoice; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_invoice (id, company_name, company_email, company_mobile, company_phone, company_po_box, company_address, invoice_number, invoice_date, client_name, subtotal, total_amount, total_in_words, payment_method, notes, status, created_at, updated_at, amount_paid, due_date, client_id) FROM stdin;
33	Rashid Typing & Document Clearing	amanev100@gmail.com	050-7441282	06-7670165	P.o Box: 7647	Opp. Tasheel, Salama, U.A.Q - UAE	INV-0001	2026-04-18	Aman	100.00	100.00		CASH/DEBIT MEMO		paid	2026-04-18 10:58:36.388926+05:30	2026-04-18 11:27:40.051116+05:30	100.00	2026-04-20	15
34	Rashid Typing & Document Clearing	rashidhuaq@gmail.com	050-7441282	06-7670165	P.o Box: 7647	Opp. Tasheel, Salama, U.A.Q - UAE	INV-0002	2026-04-18	Aman	0.00	150.00		CASH/DEBIT MEMO		work_order	2026-04-18 11:59:42.860247+05:30	2026-04-18 11:59:42.860259+05:30	0.00	\N	\N
\.


--
-- Data for Name: invoices_invoiceitem; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_invoiceitem (id, description, quantity, rate, amount, invoice_id, card_payment, payment_done) FROM stdin;
65	ICA Fee	1	50.00	50.00	33	30.00	t
66	ICA Fee	1	50.00	50.00	33	30.00	f
\.


--
-- Data for Name: invoices_lead; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_lead (id, name, email, phone, company, source, status, notes, estimated_value, created_at, updated_at, converted_client_id) FROM stdin;
\.


--
-- Data for Name: invoices_ledgerentry; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_ledgerentry (id, entry_type, reference, debit, credit, running_balance, date, notes, created_at, client_id, related_credit_tx_id, related_invoice_id, related_payment_id) FROM stdin;
47	INVOICE	INV-0001	100.00	0.00	100.00	2026-04-18	Invoice updated: INV-0001	2026-04-18 10:58:36.408269+05:30	15	\N	33	\N
48	PAYMENT	INV-0001 / cash	0.00	100.00	0.00	2026-04-18		2026-04-18 11:27:40.068783+05:30	15	\N	33	11
\.


--
-- Data for Name: invoices_payment; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_payment (id, amount, payment_date, payment_method, reference_number, notes, created_at, created_by, invoice_id) FROM stdin;
11	100.00	2026-04-18	cash			2026-04-18 11:27:40.027756+05:30		33
\.


--
-- Data for Name: invoices_paymentlink; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_paymentlink (id, link_code, amount, status, expires_at, paid_at, created_at, invoice_id) FROM stdin;
\.


--
-- Data for Name: invoices_service; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_service (id, name, description, default_price, category, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: invoices_supplier; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_supplier (id, name, email, phone, address, category, balance, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: invoices_transaction; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_transaction (id, transaction_type, amount, category, description, date, reference_number, notes, created_at, related_expense_id, related_invoice_id, related_payment_id, wallet_id) FROM stdin;
\.


--
-- Data for Name: invoices_wallet; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_wallet (id, name, balance, wallet_type, is_active, created_at, updated_at, client_id, bank_name) FROM stdin;
3	ABCD	0.00	bank	t	2026-04-13 17:58:17.848816+05:30	2026-04-13 17:58:17.848834+05:30	\N	bannk
4	AMAN	0.00	bank	t	2026-04-17 10:59:04.278275+05:30	2026-04-17 10:59:04.279016+05:30	\N	AA
\.


--
-- Data for Name: invoices_workorder; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_workorder (id, work_order_number, status, count, total_count, description, created_at, updated_at, client_id, notes, payment_method, subtotal, total_amount, due_date, start_date) FROM stdin;
\.


--
-- Data for Name: invoices_workorderitem; Type: TABLE DATA; Schema: public; Owner: invoice_user
--

COPY public.invoices_workorderitem (id, description, quantity, rate, amount, work_order_id) FROM stdin;
\.


--
-- Name: auth_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.auth_group_id_seq', 1, false);


--
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.auth_group_permissions_id_seq', 1, false);


--
-- Name: auth_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.auth_permission_id_seq', 112, true);


--
-- Name: auth_user_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.auth_user_groups_id_seq', 1, false);


--
-- Name: auth_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.auth_user_id_seq', 1, true);


--
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.auth_user_user_permissions_id_seq', 1, false);


--
-- Name: django_admin_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.django_admin_log_id_seq', 1, false);


--
-- Name: django_content_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.django_content_type_id_seq', 28, true);


--
-- Name: django_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.django_migrations_id_seq', 39, true);


--
-- Name: invoices_activitylog_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_activitylog_id_seq', 69, true);


--
-- Name: invoices_bookmark_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_bookmark_id_seq', 1, false);


--
-- Name: invoices_client_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_client_id_seq', 14, true);


--
-- Name: invoices_commission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_commission_id_seq', 1, true);


--
-- Name: invoices_companysettings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_companysettings_id_seq', 1, false);


--
-- Name: invoices_credittransaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_credittransaction_id_seq', 4, true);


--
-- Name: invoices_document_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_document_id_seq', 1, false);


--
-- Name: invoices_emailhistory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_emailhistory_id_seq', 3, true);


--
-- Name: invoices_employee_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_employee_id_seq', 1, true);


--
-- Name: invoices_expense_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_expense_id_seq', 1, false);


--
-- Name: invoices_invoice_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_invoice_id_seq', 32, true);


--
-- Name: invoices_invoiceitem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_invoiceitem_id_seq', 59, true);


--
-- Name: invoices_lead_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_lead_id_seq', 1, false);


--
-- Name: invoices_ledgerentry_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_ledgerentry_id_seq', 46, true);


--
-- Name: invoices_payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_payment_id_seq', 10, true);


--
-- Name: invoices_paymentlink_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_paymentlink_id_seq', 1, false);


--
-- Name: invoices_service_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_service_id_seq', 1, false);


--
-- Name: invoices_supplier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_supplier_id_seq', 1, false);


--
-- Name: invoices_transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_transaction_id_seq', 1, false);


--
-- Name: invoices_wallet_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_wallet_id_seq', 4, true);


--
-- Name: invoices_workorder_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_workorder_id_seq', 3, true);


--
-- Name: invoices_workorderitem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: invoice_user
--

SELECT pg_catalog.setval('public.invoices_workorderitem_id_seq', 1, false);


--
-- Name: auth_group auth_group_name_key; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_name_key UNIQUE (name);


--
-- Name: auth_group_permissions auth_group_permissions_group_id_permission_id_0cd325b0_uniq; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_permission_id_0cd325b0_uniq UNIQUE (group_id, permission_id);


--
-- Name: auth_group_permissions auth_group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_pkey PRIMARY KEY (id);


--
-- Name: auth_group auth_group_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_pkey PRIMARY KEY (id);


--
-- Name: auth_permission auth_permission_content_type_id_codename_01ab375a_uniq; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_codename_01ab375a_uniq UNIQUE (content_type_id, codename);


--
-- Name: auth_permission auth_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_pkey PRIMARY KEY (id);


--
-- Name: auth_user_groups auth_user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_pkey PRIMARY KEY (id);


--
-- Name: auth_user_groups auth_user_groups_user_id_group_id_94350c0c_uniq; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_group_id_94350c0c_uniq UNIQUE (user_id, group_id);


--
-- Name: auth_user auth_user_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_pkey PRIMARY KEY (id);


--
-- Name: auth_user_user_permissions auth_user_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_pkey PRIMARY KEY (id);


--
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_permission_id_14a6b632_uniq; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_permission_id_14a6b632_uniq UNIQUE (user_id, permission_id);


--
-- Name: auth_user auth_user_username_key; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_username_key UNIQUE (username);


--
-- Name: django_admin_log django_admin_log_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_pkey PRIMARY KEY (id);


--
-- Name: django_content_type django_content_type_app_label_model_76bd3d3b_uniq; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_app_label_model_76bd3d3b_uniq UNIQUE (app_label, model);


--
-- Name: django_content_type django_content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_pkey PRIMARY KEY (id);


--
-- Name: django_migrations django_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.django_migrations
    ADD CONSTRAINT django_migrations_pkey PRIMARY KEY (id);


--
-- Name: django_session django_session_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.django_session
    ADD CONSTRAINT django_session_pkey PRIMARY KEY (session_key);


--
-- Name: invoices_activitylog invoices_activitylog_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_activitylog
    ADD CONSTRAINT invoices_activitylog_pkey PRIMARY KEY (id);


--
-- Name: invoices_bookmark invoices_bookmark_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_bookmark
    ADD CONSTRAINT invoices_bookmark_pkey PRIMARY KEY (id);


--
-- Name: invoices_client invoices_client_name_key; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_client
    ADD CONSTRAINT invoices_client_name_key UNIQUE (name);


--
-- Name: invoices_client invoices_client_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_client
    ADD CONSTRAINT invoices_client_pkey PRIMARY KEY (id);


--
-- Name: invoices_commission invoices_commission_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_commission
    ADD CONSTRAINT invoices_commission_pkey PRIMARY KEY (id);


--
-- Name: invoices_companysettings invoices_companysettings_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_companysettings
    ADD CONSTRAINT invoices_companysettings_pkey PRIMARY KEY (id);


--
-- Name: invoices_credittransaction invoices_credittransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_credittransaction
    ADD CONSTRAINT invoices_credittransaction_pkey PRIMARY KEY (id);


--
-- Name: invoices_document invoices_document_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_document
    ADD CONSTRAINT invoices_document_pkey PRIMARY KEY (id);


--
-- Name: invoices_emailhistory invoices_emailhistory_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_emailhistory
    ADD CONSTRAINT invoices_emailhistory_pkey PRIMARY KEY (id);


--
-- Name: invoices_employee invoices_employee_email_key; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_employee
    ADD CONSTRAINT invoices_employee_email_key UNIQUE (email);


--
-- Name: invoices_employee invoices_employee_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_employee
    ADD CONSTRAINT invoices_employee_pkey PRIMARY KEY (id);


--
-- Name: invoices_expense invoices_expense_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_expense
    ADD CONSTRAINT invoices_expense_pkey PRIMARY KEY (id);


--
-- Name: invoices_invoice invoices_invoice_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_invoice
    ADD CONSTRAINT invoices_invoice_invoice_number_key UNIQUE (invoice_number);


--
-- Name: invoices_invoice invoices_invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_invoice
    ADD CONSTRAINT invoices_invoice_pkey PRIMARY KEY (id);


--
-- Name: invoices_invoiceitem invoices_invoiceitem_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_invoiceitem
    ADD CONSTRAINT invoices_invoiceitem_pkey PRIMARY KEY (id);


--
-- Name: invoices_lead invoices_lead_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_lead
    ADD CONSTRAINT invoices_lead_pkey PRIMARY KEY (id);


--
-- Name: invoices_ledgerentry invoices_ledgerentry_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_ledgerentry
    ADD CONSTRAINT invoices_ledgerentry_pkey PRIMARY KEY (id);


--
-- Name: invoices_payment invoices_payment_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_payment
    ADD CONSTRAINT invoices_payment_pkey PRIMARY KEY (id);


--
-- Name: invoices_paymentlink invoices_paymentlink_link_code_key; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_paymentlink
    ADD CONSTRAINT invoices_paymentlink_link_code_key UNIQUE (link_code);


--
-- Name: invoices_paymentlink invoices_paymentlink_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_paymentlink
    ADD CONSTRAINT invoices_paymentlink_pkey PRIMARY KEY (id);


--
-- Name: invoices_service invoices_service_name_key; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_service
    ADD CONSTRAINT invoices_service_name_key UNIQUE (name);


--
-- Name: invoices_service invoices_service_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_service
    ADD CONSTRAINT invoices_service_pkey PRIMARY KEY (id);


--
-- Name: invoices_supplier invoices_supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_supplier
    ADD CONSTRAINT invoices_supplier_pkey PRIMARY KEY (id);


--
-- Name: invoices_transaction invoices_transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_transaction
    ADD CONSTRAINT invoices_transaction_pkey PRIMARY KEY (id);


--
-- Name: invoices_wallet invoices_wallet_name_key; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_wallet
    ADD CONSTRAINT invoices_wallet_name_key UNIQUE (name);


--
-- Name: invoices_wallet invoices_wallet_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_wallet
    ADD CONSTRAINT invoices_wallet_pkey PRIMARY KEY (id);


--
-- Name: invoices_workorder invoices_workorder_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_workorder
    ADD CONSTRAINT invoices_workorder_pkey PRIMARY KEY (id);


--
-- Name: invoices_workorder invoices_workorder_work_order_number_key; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_workorder
    ADD CONSTRAINT invoices_workorder_work_order_number_key UNIQUE (work_order_number);


--
-- Name: invoices_workorderitem invoices_workorderitem_pkey; Type: CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_workorderitem
    ADD CONSTRAINT invoices_workorderitem_pkey PRIMARY KEY (id);


--
-- Name: auth_group_name_a6ea08ec_like; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX auth_group_name_a6ea08ec_like ON public.auth_group USING btree (name varchar_pattern_ops);


--
-- Name: auth_group_permissions_group_id_b120cbf9; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX auth_group_permissions_group_id_b120cbf9 ON public.auth_group_permissions USING btree (group_id);


--
-- Name: auth_group_permissions_permission_id_84c5c92e; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX auth_group_permissions_permission_id_84c5c92e ON public.auth_group_permissions USING btree (permission_id);


--
-- Name: auth_permission_content_type_id_2f476e4b; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX auth_permission_content_type_id_2f476e4b ON public.auth_permission USING btree (content_type_id);


--
-- Name: auth_user_groups_group_id_97559544; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX auth_user_groups_group_id_97559544 ON public.auth_user_groups USING btree (group_id);


--
-- Name: auth_user_groups_user_id_6a12ed8b; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX auth_user_groups_user_id_6a12ed8b ON public.auth_user_groups USING btree (user_id);


--
-- Name: auth_user_user_permissions_permission_id_1fbb5f2c; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX auth_user_user_permissions_permission_id_1fbb5f2c ON public.auth_user_user_permissions USING btree (permission_id);


--
-- Name: auth_user_user_permissions_user_id_a95ead1b; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX auth_user_user_permissions_user_id_a95ead1b ON public.auth_user_user_permissions USING btree (user_id);


--
-- Name: auth_user_username_6821ab7c_like; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX auth_user_username_6821ab7c_like ON public.auth_user USING btree (username varchar_pattern_ops);


--
-- Name: django_admin_log_content_type_id_c4bce8eb; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX django_admin_log_content_type_id_c4bce8eb ON public.django_admin_log USING btree (content_type_id);


--
-- Name: django_admin_log_user_id_c564eba6; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX django_admin_log_user_id_c564eba6 ON public.django_admin_log USING btree (user_id);


--
-- Name: django_session_expire_date_a5c62663; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX django_session_expire_date_a5c62663 ON public.django_session USING btree (expire_date);


--
-- Name: django_session_session_key_c0390e0f_like; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX django_session_session_key_c0390e0f_like ON public.django_session USING btree (session_key varchar_pattern_ops);


--
-- Name: invoices_client_name_e855459c_like; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_client_name_e855459c_like ON public.invoices_client USING btree (name varchar_pattern_ops);


--
-- Name: invoices_commission_invoice_id_e29c9d4c; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_commission_invoice_id_e29c9d4c ON public.invoices_commission USING btree (invoice_id);


--
-- Name: invoices_credittransaction_client_id_6ef13507; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_credittransaction_client_id_6ef13507 ON public.invoices_credittransaction USING btree (client_id);


--
-- Name: invoices_document_client_id_31b9b182; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_document_client_id_31b9b182 ON public.invoices_document USING btree (client_id);


--
-- Name: invoices_emailhistory_invoice_id_4d323784; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_emailhistory_invoice_id_4d323784 ON public.invoices_emailhistory USING btree (invoice_id);


--
-- Name: invoices_employee_email_6dd7b700_like; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_employee_email_6dd7b700_like ON public.invoices_employee USING btree (email varchar_pattern_ops);


--
-- Name: invoices_expense_wallet_id_f1c2b1ff; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_expense_wallet_id_f1c2b1ff ON public.invoices_expense USING btree (wallet_id);


--
-- Name: invoices_invoice_client_id_b83ca539; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_invoice_client_id_b83ca539 ON public.invoices_invoice USING btree (client_id);


--
-- Name: invoices_invoice_invoice_number_69d5c6a9_like; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_invoice_invoice_number_69d5c6a9_like ON public.invoices_invoice USING btree (invoice_number varchar_pattern_ops);


--
-- Name: invoices_invoiceitem_invoice_id_5ce05433; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_invoiceitem_invoice_id_5ce05433 ON public.invoices_invoiceitem USING btree (invoice_id);


--
-- Name: invoices_lead_converted_client_id_dc096f72; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_lead_converted_client_id_dc096f72 ON public.invoices_lead USING btree (converted_client_id);


--
-- Name: invoices_ledgerentry_client_id_2320866d; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_ledgerentry_client_id_2320866d ON public.invoices_ledgerentry USING btree (client_id);


--
-- Name: invoices_ledgerentry_related_credit_tx_id_4a360d59; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_ledgerentry_related_credit_tx_id_4a360d59 ON public.invoices_ledgerentry USING btree (related_credit_tx_id);


--
-- Name: invoices_ledgerentry_related_invoice_id_86cb005f; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_ledgerentry_related_invoice_id_86cb005f ON public.invoices_ledgerentry USING btree (related_invoice_id);


--
-- Name: invoices_ledgerentry_related_payment_id_c3bf1eb2; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_ledgerentry_related_payment_id_c3bf1eb2 ON public.invoices_ledgerentry USING btree (related_payment_id);


--
-- Name: invoices_payment_invoice_id_d69b2c32; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_payment_invoice_id_d69b2c32 ON public.invoices_payment USING btree (invoice_id);


--
-- Name: invoices_paymentlink_invoice_id_6162ad5e; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_paymentlink_invoice_id_6162ad5e ON public.invoices_paymentlink USING btree (invoice_id);


--
-- Name: invoices_paymentlink_link_code_1f0497de_like; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_paymentlink_link_code_1f0497de_like ON public.invoices_paymentlink USING btree (link_code varchar_pattern_ops);


--
-- Name: invoices_service_name_13360d80_like; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_service_name_13360d80_like ON public.invoices_service USING btree (name varchar_pattern_ops);


--
-- Name: invoices_transaction_related_expense_id_9df0a0f5; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_transaction_related_expense_id_9df0a0f5 ON public.invoices_transaction USING btree (related_expense_id);


--
-- Name: invoices_transaction_related_invoice_id_628d97e1; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_transaction_related_invoice_id_628d97e1 ON public.invoices_transaction USING btree (related_invoice_id);


--
-- Name: invoices_transaction_related_payment_id_990a2693; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_transaction_related_payment_id_990a2693 ON public.invoices_transaction USING btree (related_payment_id);


--
-- Name: invoices_transaction_wallet_id_1804b4c2; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_transaction_wallet_id_1804b4c2 ON public.invoices_transaction USING btree (wallet_id);


--
-- Name: invoices_wallet_client_id_3d5779eb; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_wallet_client_id_3d5779eb ON public.invoices_wallet USING btree (client_id);


--
-- Name: invoices_wallet_name_aca60adc_like; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_wallet_name_aca60adc_like ON public.invoices_wallet USING btree (name varchar_pattern_ops);


--
-- Name: invoices_workorder_client_id_a7151d9c; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_workorder_client_id_a7151d9c ON public.invoices_workorder USING btree (client_id);


--
-- Name: invoices_workorder_work_order_number_58620d6f_like; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_workorder_work_order_number_58620d6f_like ON public.invoices_workorder USING btree (work_order_number varchar_pattern_ops);


--
-- Name: invoices_workorderitem_work_order_id_72262201; Type: INDEX; Schema: public; Owner: invoice_user
--

CREATE INDEX invoices_workorderitem_work_order_id_72262201 ON public.invoices_workorderitem USING btree (work_order_id);


--
-- Name: auth_group_permissions auth_group_permissio_permission_id_84c5c92e_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissio_permission_id_84c5c92e_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_group_permissions auth_group_permissions_group_id_b120cbf9_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_b120cbf9_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_permission auth_permission_content_type_id_2f476e4b_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_2f476e4b_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_user_groups auth_user_groups_group_id_97559544_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_group_id_97559544_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_user_groups auth_user_groups_user_id_6a12ed8b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_6a12ed8b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_user_user_permissions auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_admin_log django_admin_log_content_type_id_c4bce8eb_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_content_type_id_c4bce8eb_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: django_admin_log django_admin_log_user_id_c564eba6_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_user_id_c564eba6_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invoices_commission invoices_commission_invoice_id_e29c9d4c_fk_invoices_invoice_id; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_commission
    ADD CONSTRAINT invoices_commission_invoice_id_e29c9d4c_fk_invoices_invoice_id FOREIGN KEY (invoice_id) REFERENCES public.invoices_invoice(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invoices_credittransaction invoices_credittrans_client_id_6ef13507_fk_invoices_; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_credittransaction
    ADD CONSTRAINT invoices_credittrans_client_id_6ef13507_fk_invoices_ FOREIGN KEY (client_id) REFERENCES public.invoices_client(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invoices_document invoices_document_client_id_31b9b182_fk_invoices_client_id; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_document
    ADD CONSTRAINT invoices_document_client_id_31b9b182_fk_invoices_client_id FOREIGN KEY (client_id) REFERENCES public.invoices_client(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invoices_emailhistory invoices_emailhistor_invoice_id_4d323784_fk_invoices_; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_emailhistory
    ADD CONSTRAINT invoices_emailhistor_invoice_id_4d323784_fk_invoices_ FOREIGN KEY (invoice_id) REFERENCES public.invoices_invoice(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invoices_expense invoices_expense_wallet_id_f1c2b1ff_fk_invoices_wallet_id; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_expense
    ADD CONSTRAINT invoices_expense_wallet_id_f1c2b1ff_fk_invoices_wallet_id FOREIGN KEY (wallet_id) REFERENCES public.invoices_wallet(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invoices_invoice invoices_invoice_client_id_b83ca539_fk_invoices_client_id; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_invoice
    ADD CONSTRAINT invoices_invoice_client_id_b83ca539_fk_invoices_client_id FOREIGN KEY (client_id) REFERENCES public.invoices_client(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invoices_invoiceitem invoices_invoiceitem_invoice_id_5ce05433_fk_invoices_invoice_id; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_invoiceitem
    ADD CONSTRAINT invoices_invoiceitem_invoice_id_5ce05433_fk_invoices_invoice_id FOREIGN KEY (invoice_id) REFERENCES public.invoices_invoice(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invoices_lead invoices_lead_converted_client_id_dc096f72_fk_invoices_; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_lead
    ADD CONSTRAINT invoices_lead_converted_client_id_dc096f72_fk_invoices_ FOREIGN KEY (converted_client_id) REFERENCES public.invoices_client(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invoices_ledgerentry invoices_ledgerentry_client_id_2320866d_fk_invoices_client_id; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_ledgerentry
    ADD CONSTRAINT invoices_ledgerentry_client_id_2320866d_fk_invoices_client_id FOREIGN KEY (client_id) REFERENCES public.invoices_client(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invoices_ledgerentry invoices_ledgerentry_related_credit_tx_id_4a360d59_fk_invoices_; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_ledgerentry
    ADD CONSTRAINT invoices_ledgerentry_related_credit_tx_id_4a360d59_fk_invoices_ FOREIGN KEY (related_credit_tx_id) REFERENCES public.invoices_credittransaction(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invoices_ledgerentry invoices_ledgerentry_related_invoice_id_86cb005f_fk_invoices_; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_ledgerentry
    ADD CONSTRAINT invoices_ledgerentry_related_invoice_id_86cb005f_fk_invoices_ FOREIGN KEY (related_invoice_id) REFERENCES public.invoices_invoice(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invoices_ledgerentry invoices_ledgerentry_related_payment_id_c3bf1eb2_fk_invoices_; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_ledgerentry
    ADD CONSTRAINT invoices_ledgerentry_related_payment_id_c3bf1eb2_fk_invoices_ FOREIGN KEY (related_payment_id) REFERENCES public.invoices_payment(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invoices_payment invoices_payment_invoice_id_d69b2c32_fk_invoices_invoice_id; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_payment
    ADD CONSTRAINT invoices_payment_invoice_id_d69b2c32_fk_invoices_invoice_id FOREIGN KEY (invoice_id) REFERENCES public.invoices_invoice(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invoices_paymentlink invoices_paymentlink_invoice_id_6162ad5e_fk_invoices_invoice_id; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_paymentlink
    ADD CONSTRAINT invoices_paymentlink_invoice_id_6162ad5e_fk_invoices_invoice_id FOREIGN KEY (invoice_id) REFERENCES public.invoices_invoice(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invoices_transaction invoices_transaction_related_expense_id_9df0a0f5_fk_invoices_; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_transaction
    ADD CONSTRAINT invoices_transaction_related_expense_id_9df0a0f5_fk_invoices_ FOREIGN KEY (related_expense_id) REFERENCES public.invoices_expense(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invoices_transaction invoices_transaction_related_invoice_id_628d97e1_fk_invoices_; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_transaction
    ADD CONSTRAINT invoices_transaction_related_invoice_id_628d97e1_fk_invoices_ FOREIGN KEY (related_invoice_id) REFERENCES public.invoices_invoice(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invoices_transaction invoices_transaction_related_payment_id_990a2693_fk_invoices_; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_transaction
    ADD CONSTRAINT invoices_transaction_related_payment_id_990a2693_fk_invoices_ FOREIGN KEY (related_payment_id) REFERENCES public.invoices_payment(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invoices_transaction invoices_transaction_wallet_id_1804b4c2_fk_invoices_wallet_id; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_transaction
    ADD CONSTRAINT invoices_transaction_wallet_id_1804b4c2_fk_invoices_wallet_id FOREIGN KEY (wallet_id) REFERENCES public.invoices_wallet(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invoices_wallet invoices_wallet_client_id_3d5779eb_fk_invoices_client_id; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_wallet
    ADD CONSTRAINT invoices_wallet_client_id_3d5779eb_fk_invoices_client_id FOREIGN KEY (client_id) REFERENCES public.invoices_client(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invoices_workorder invoices_workorder_client_id_a7151d9c_fk_invoices_client_id; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_workorder
    ADD CONSTRAINT invoices_workorder_client_id_a7151d9c_fk_invoices_client_id FOREIGN KEY (client_id) REFERENCES public.invoices_client(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: invoices_workorderitem invoices_workorderit_work_order_id_72262201_fk_invoices_; Type: FK CONSTRAINT; Schema: public; Owner: invoice_user
--

ALTER TABLE ONLY public.invoices_workorderitem
    ADD CONSTRAINT invoices_workorderit_work_order_id_72262201_fk_invoices_ FOREIGN KEY (work_order_id) REFERENCES public.invoices_workorder(id) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO invoice_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO invoice_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO invoice_user;


--
-- PostgreSQL database dump complete
--

\unrestrict Uk3XctpIX45yVYa1RAII74hDstMFDnfen8vCY7C0mERzVyfuFVFyKeBJhU1KQ5Q

