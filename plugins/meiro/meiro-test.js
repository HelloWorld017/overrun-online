var form;
$(document).on('ready', function(){
	form = $('#code-form');
});

var testRunning = false;
test['MEIRO-RANKED'] = function(){
	if(testRunning) return;
	testRunning = true;
	$.ajax({
		url: form.attr('action'),
		method: 'POST',
		data: form.serialize()
	}).always(function(data){
		if(data.responseText || data.error){
			alert(JSON.parse(data.responseText).error);
			testRunning = false;
			return;
		}

		form.attr('action', '/build/edit/' + data.id);
		$.ajax({
			url: '/battle/entry/MEIRO-TEST/' + data.id + '/',
			method: 'POST'
		}).always(function(data){
			testRunning = false;
			if(!data['game-finish']){
				if(data.responseText) alert(JSON.parse(data.responseText).error);
				else alert(data.err);
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
