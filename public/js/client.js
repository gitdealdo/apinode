var socket = io();

socket.on("new image",function(data){
	data = JSON.parse(data);
	console.log('-------------');
	console.log(data);
	console.log('-------------');
});