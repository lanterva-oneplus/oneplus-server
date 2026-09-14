-- 1. 사용자 정보 테이블
CREATE TABLE
  IF NOT EXISTS users (
    id bigserial PRIMARY KEY,
    sub varchar(255) NOT NULL UNIQUE,
    email varchar(254) NOT NULL,
    nickname varchar(32) NOT NULL,
    profile varchar(2048) NOT NULL
  );

-- 1-2. 사용자 상태 enum 생성
CREATE TYPE user_status AS enum ('active', 'inactive', 'banned', 'deleted');

-- 1-3. 컬럼추가
ALTER TABLE users
ADD COLUMN IF NOT EXISTS status user_status;

-- 2. 트랙 정보 테이블
CREATE TABLE
  IF NOT EXISTS tracks (
    id bigserial PRIMARY KEY,
    track_name varchar(64) NOT NULL,
    length_sec smallint NOT NULL CHECK (length_sec >= 0),
    track_path varchar(1028) NOT NULL,
    added_date date DEFAULT CURRENT_DATE
  );

-- 3. 난이도 enum 생성
CREATE TYPE track_difficulty AS ENUM ('easy', 'normal', 'hard', 'expert');

-- 4. 트랙 난이도별 정보 테이블
CREATE TABLE
  IF NOT EXISTS track_infos (
    id bigserial PRIMARY KEY,
    track_id bigint NOT NULL,
    difficulty track_difficulty NOT NULL,
    note_count smallint NOT NULL CHECK (note_count >= 0),
    note jsonb NOT NULL,
    FOREIGN KEY (track_id) REFERENCES tracks (id)
  );

-- 5. 트랙 난이도 중복 방지 및 성능 향상을 위한 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_track_id_difficulty ON track_infos (track_id, difficulty);