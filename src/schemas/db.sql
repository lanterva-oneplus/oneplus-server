-- 사용자 정보
create table
  if not exists users (
    id bigserial primary key,
    sub varchar(255) not null unique, -- 자동 인덱싱처리
    email varchar(254) not null,
    nickname varchar(32) not null,
    profile varchar(2048) not null,
  );

-- 트랙 정보
create table
  if not exists tracks (
    id bigserial primary key,
    track_name varchar(64) not null,
    length_sec smallint not null check (length_sec >= 0),
    track_path varchar(1028) not null,
    added_date date default CURRENT_DATE
  );

-- 난이도 enum
create type if not exists track_defficulty as enum ('easy', 'normal', 'hard', 'expert');

-- 트랙 난이도별 정보
create table
  if not exists track_infos (
    id bigserial primary key,
    track_id bigserial not null,
    difficulty track_defficulty not null,
    note_count smallint not null check (note_count >= 0),
    note jsonb not null,
    foreign key (track_id) references tracks (id),
  );

-- 트랙 난이도 중복 방지
create index if not exists idx_track_id_difficulty on track_infos (track_id, difficulty);