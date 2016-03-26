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

class AlreadyEntriedError extends HttpError{
	constructor(){
		super(global.translator('error.alreadyentried'), 400);
	}
}

class AlreadyLoggedInError extends HttpError{
	constructor(){
		super(global.translator('error.alreadyloggedin'), 400);
	}
}

class CaptchaError extends HttpError{
	constructor(){
		super(global.translator('error.captcha'), 403);
	}
}

class EntryFirstError extends StatusError{
	constructor(){
		super(global.translator('error.entryfirst'), 204);
	}
}

class EmailNotVerifiedError extends HttpError{
	constructor(){
		super(global.translator('error.emailnotverified'), 403);
	}
}

class InsufficientMoneyError extends HttpError{
	constructor(){
		super(global.translator('error.insufficientmoney'), 403);
	}
}

class InvalidDataError extends HttpError{
	constructor(){
		super(global.translator('error.invaliddata'), 400);
	}
}

class InvalidTokenError extends HttpError{
	constructor(){
		super(global.translator('error.invalidtoken'), 403);
	}
}

class NoPermissionError extends HttpError{
	constructor(){
		super(global.translator('error.nopermission'), 403);
	}
}

class NotLoggedInError extends RedirectError{
	constructor(){
		super(global.translator('error.notloggedin'), 401, '/login');
	}
}

class PasswordNotEqualError extends HttpError{
		constructor(){
			super(global.translator('error.passwordnotequal'), 400);
		}
}

class SameIdAlreadyJoinedError extends HttpError{
	constructor(){
		super(global.translator('error.sameidalreadyjoined'), 400);
	}
}

class ServerError extends HttpError{
	constructor(){
		super(global.translator('error.internalserver'), 500);
	}
}

class TooLongCodeError extends HttpError{
	constructor(){
		super(global.translator('error.toolongcode'), 400);
	}
}

class TooManyBotsError extends HttpError{
	constructor(){
		super(global.translator('error.toomanybots'), 403);
	}
}

class WrongSessionError extends HttpError{
	constructor(){
		super(global.translator('error.wrongsession'), 400);
	}
}

module.exports = {
	HttpError: HttpError,
	RedirectError: RedirectError,
	StatusError: StatusError,
	AlreadyEntriedError: AlreadyEntriedError,
	AlreadyLoggedInError: AlreadyLoggedInError,
	CaptchaError: CaptchaError,
	EmailNotVerifiedError: EmailNotVerifiedError,
	EntryFirstError: EntryFirstError,
	InsufficientMoneyError: InsufficientMoneyError,
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
