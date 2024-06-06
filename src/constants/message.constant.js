import { MIN_PASSWORD_LENGTH, MIN_ID_LENGTH } from './auth.constant.js';

export const MESSAGES = {
    AUTH: {
        COMMON: {
            EMAIL: {
                REQUIRED: '이메일을 입력해 주세요.',
                INVALID_FORMAT: '이메일 형식이 올바르지 않습니다.',
            },
            PASSWORD: {
                REQUIRED: '비밀번호을 입력해 주세요.',
                MIN_LENGTH: `비밀번호는 ${MIN_PASSWORD_LENGTH}자리 이상이어야 합니다.`,
            },
            PASSWORD_CONFIRM: {
                REQUIRED: '비밀번호 확인을 입력해 주세요.',
                NOT_MATCHED_WITH_PASSWORD:
                    '입력 한 두 비밀번호가 일치하지 않습니다.',
            },
            NICKNAME: {
                REQUIRED: '이름을 입력해 주세요.',
            },
            PHONE_NUMBER: {
                REQUIRED: '전화번호를 입력해 주세요.',
            },
            DUPLICATED: '이미 가입된 사용자 입니다.',
            UNAUTHORIZED: '인증 정보가 유효하지 않습니다.',
            FORBIDDEN: '접근 권한이 없습니다.',
            JWT: {
                NO_TOKEN: '인증 정보가 없습니다.',
                NOT_SUPPORTED_TYPE: '지원하지 않는 인증방식 입니다.',
                EXPIRED: '인증 정보가 만료 되었습니다',
                NO_USER: '인증 정보와 일치하는 사용자가 없습니다.',
                INVALID: '인증 정보가 유효하지 않습니다.',
                DISCARDED_TOKEN: '폐기된 인증 정보입니다.',
            },
        },
        SIGN_UP: {
            SECCEED: '회원가입에 성공했습니다.',
        },
        SIGN_IN: {
            SECCEED: '로그인에 성공했습니다.',
        },
        SIGN_OUT: {
            SECCEED: '로그아웃에 성공했습니다.',
        },
        TOKEN: {
            SECCEED: '토큰 재발급에 성공했습니다.',
        },
        EMAIL_VERIFICATION: {
            SUCCESS: '이메일 인증 메세지 전송에 성공했습니다.',
            FAILURE: '인증 메세지를 전송 할 수 없습니다.',
        },
        EMAIL_CHECK: {
            DUPLICATE: '이미 사용 중인 이메일입니다.',
            AVAILABLE: '사용 가능한 이메일입니다.',
        },
        EMAIL_VERIFICATION_CODE: {
            SUCCESS: '이메일 인증코드가 확인되었습니다.',
            FAILURE: '유효하지 않은 인증코드입니다.',
        },
    },
    USERS: {
        READ_ME: {
            SUCCEED: '내 정보 조회에 성공했습니다.',
        },
        UPDATE_ME: {
            SUCCEED: '내 정보 수정에 성공했습니다.',
            NO_BODY_DATA: '수정할 데이터를 입력해주세요',
        },
    },
    POSTS: {
        COMMON: {
            TITLE: {
                REQUIRED: '제목을 입력해 주세요',
            },
            CONTENT: {
                REQUIRED: '내용을 입력해 주세요',
                MIN_LENGTH: '내용은 5자 이상 입력해주세요.',
            },
            NOT_FOUND: '게시물이 존재하지 않습니다.',
        },
        CREATE: {
            SUCCEED: '게시물 생성에 성공했습니다.',
        },
        READ_LIST: {
            SUCCEED: '게시물 목록 조회에 성공했습니다.',
        },
        READ_DETAIL: {
            SUCCEED: '게시물 상세 조회에 성공했습니다.',
        },
        UPDATE: {
            SUCCEED: '게시물 수정에 성공했습니다.',
            NO_BODY_DATA: '수정 할 정보를 입력해 주세요.',
        },
        DELETE: {
            SUCCEED: '게시물 삭제에 성공했습니다.',
        },
    },
};
