test['MEIRO-RANKED'] = function(){
	$.ajax({
		url: window.location,
		method: 'POST',
		data: $('#code-form').serialize()
	}).done(function(data){
		$.ajax({
			url: '/battle/entry/MEIRO-TEST/' + data.id + '/',
			method: 'POST'
		}).done(function(data){
			if(data['game-finish'] === false){
				alert(data.err);
				return;
			}

			if(ingame){
				stopRequested = function(){
					wholeLog = data;
					gameLog = data.log;
					logType = data.type;
					handlers[logType]();
				};
				return;
			}
			//Log handler
			wholeLog = data;
			gameLog = data.log;
			logType = data.type;
			handlers[logType]();
		});
	});
};

test['MEIRO-UNRANKED'] = test['MEIRO-RANKED'];
