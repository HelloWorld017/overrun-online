var callbacks = [];
var Server = {
	trigger: function(name, data){
		callbacks.forEach((v) => {
			v(name, data);
		});
	},

	bind: function(callback){
		callbacks.push(callback);
	}
};

module.exports = Server;
