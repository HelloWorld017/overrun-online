'use strict';

class HttpError extends Error{
	constructor(message, status){
		super(message);
		this.status = status;
	}

	statusCode(){
		return this.status;
	}
}

class AlreadyLoggedInError extends HttpError{
	constructor(){
		super(global.translation['error-alreadyloggedin'], 400);
	}
}

class CaptchaError extends HttpError{
	constructor(){
		super(global.translation['error-captcha'], 403);
	}
}

class EmailNotVerifiedError extends HttpError{
	constructor(){
		super(global.translation['error-emailnotverified'], 403);
	}
}

class InvalidDataError extends HttpError{
	constructor(){
		super(global.translation['error-invaliddata'], 400);
	}
}

class InvalidTokenError extends HttpError{
	constructor(){
		super(global.translation['error-invalidtoken'], 403);
	}
}

class NoPermissionError extends HttpError{
	constructor(){
		super(global.translation['error-nopermission'], 403);
	}
}

class NotLoggedInError extends HttpError{
	constructor(){
		super(global.translation['error-notloggedin'], 401);
	}
}

class PasswordNotEqualError extends HttpError{
		constructor(){
			super(global.translation['error-passwordnotequal'], 400);
		}
}

class ServerError extends HttpError{
	constructor(){
		super(global.translation['error-internalserver'], 500);
	}
}

class WrongSessionError extends HttpError{
	constructor(){
		super(global.translation['error-wrongsession'], 400);
	}
}

class SameIdAlreadyJoinedError extends HttpError{
	constructor(){
		super(global.translation['error-sameidalreadyjoined'], 400);
	}
}

module.exports = {
	HttpError: HttpError,
	AlreadyLoggedInError: AlreadyLoggedInError,
	CaptchaError: CaptchaError,
	EmailNotVerifiedError: EmailNotVerifiedError,
	InvalidDataError: InvalidDataError,
	InvalidTokenError: InvalidTokenError,
	NoPermissionError: NoPermissionError,
	NotLoggedInError: NotLoggedInError,
	PasswordNotEqualError: PasswordNotEqualError,
	ServerError: ServerError,
	WrongSessionError: WrongSessionError,
	SameIdAlreadyJoinedError: SameIdAlreadyJoinedError
};
