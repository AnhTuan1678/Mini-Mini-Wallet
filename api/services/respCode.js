module.exports = {
  SUCCESS: {
    code: 200,
    message: 'Thành công',
  },

  BAD_REQUEST: {
    code: 400,
    message: 'Yêu cầu không hợp lệ',
  },

  UNAUTHORIZED: {
    code: 401,
    message: 'Chưa đăng nhập hoặc token không hợp lệ',
  },

  FORBIDDEN: {
    code: 403,
    message: 'Không được phép truy cập',
  },

  NOT_FOUND: {
    code: 404,
    message: 'Không tìm thấy tài nguyên',
  },

  INTERNAL_SERVER_ERROR: {
    code: 500,
    message: 'Lỗi máy chủ',
  },
};
