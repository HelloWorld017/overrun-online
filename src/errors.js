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

class StatusError extends HttpError{
	constructor(message, status){
		super(message, status);
	}
}

class RedirectError extends HttpError{
	constructor(message, status, redirect){
		super(message, status);
		this.redirect = redirect;
	}

	getRedirect(){
		return this.redirect;
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

class EntryFirstError extends StatusError{
	constructor(){
		super(global.translation['error-entryfirst'], 204);
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

class NotLoggedInError extends RedirectError{
	constructor(){
		super(global.translation['error-notloggedin'], 401, '/login');
	}
}

class PasswordNotEqualError extends HttpError{
		constructor(){
			super(global.translation['error-passwordnotequal'], 400);
		}
}

class SameIdAlreadyJoinedError extends HttpError{
	constructor(){
		super(global.translation['error-sameidalreadyjoined'], 400);
	}
}

class ServerError extends HttpError{
	constructor(){
		super(global.translation['error-internalserver'], 500);
	}
}

class TooLongCodeError extends HttpError{
	constructor(){
		super(global.translation['error-toolongcode'], 400);
	}
}

class TooManyBotsError extends HttpError{
	constructor(){
		super(global.translation['error-toomanybots'], 403);
	}
}

class WrongSessionError extends HttpError{
	constructor(){
		super(global.translation['error-wrongsession'], 400);
	}
}

module.exports = {
	HttpError: HttpError,
	RedirectError: RedirectError,
	StatusError: StatusError,
	AlreadyLoggedInError: AlreadyLoggedInError,
	CaptchaError: CaptchaError,
	EmailNotVerifiedError: EmailNotVerifiedError,
	EntryFirstError: EntryFirstError,
	InvalidDataError: InvalidDataError,
	InvalidTokenError: InvalidTokenError,
	NoPermissionError: NoPermissionError,
	NotLoggedInError: NotLoggedInError,
	PasswordNotEqualError: PasswordNotEqualError,
	SameIdAlreadyJoinedError: SameIdAlreadyJoinedError,
	ServerError: ServerError,
	TooLongCodeError: TooLongCodeError,
	TooManyBotsError: TooManyBotsError,
	WrongSessionError: WrongSessionError,
};
