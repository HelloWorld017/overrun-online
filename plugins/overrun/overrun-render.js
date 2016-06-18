handlers['OVERRUN'] = (function(){
	var ctx = canvas.getContext('2d');
	gameLog.forEach(function(roundLog, round){
		async.forEachOf(roundLog, function(v, k, cb){
			(v[0] || {data: {log: []}}).data.log.forEach(function(v){
				printLog(v.content + '\n' + v.data);
			});
			cb();
		});
	});
});
