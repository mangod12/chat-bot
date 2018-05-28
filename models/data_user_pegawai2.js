let bcrypt = require('bcryptjs');
// node-datetime
let dateTime = require('node-datetime');
let dt = dateTime.create(); dt.format('m/d/Y H:M:S');
// ./node-datetime
let sanitizer = require('sanitizer');// Handling Input Xss

// Connection
let mysql      = require('mysql');
let connection = mysql.createConnection({
	host : "localhost",
	user : "root",
	password : "",
	database : "man2",
	multipleStatements: true
});
// ./Connection

exports.dashboard = function(req, res){
	let userId = req.session.userId;
	if(userId == null){
	  res.redirect("/");
	  return;
	}
	let sql = "SELECT * FROM pesan_chat_pengguna WHERE pengirim_pesan_chat_pengguna='"+userId+"' or penerima_pesan_chat_pengguna='"+userId+"' order by waktu_pesan_chat_pengguna asc";
	req.getConnection(function (err, connection) {
	 connection.query(sql, function (err, results) {
	   res.render('dashboard.ejs',{data:results, session:userId});
		 // res.writeHead(200, {'Context-Type' : 'application/json'});
		 // res.end(JSON.stringify(results));
	 });
	});
};

// History chat
exports.chat_user_pegawai_history = function(req, res){
  let userId = req.session.userId;
  if(userId == null){
		res.redirect("/");
		return;
  }
  let sql = "SELECT * FROM pesan_chat_pengguna WHERE pengirim_pesan_chat_pengguna='"+userId+"' or penerima_pesan_chat_pengguna='"+userId+"' order by waktu_pesan_chat_pengguna asc";
  req.getConnection(function (err, connection) {
    connection.query(sql, function (err, results) {
			// console.log(results);
      // res.writeHead(200, {'Context-Type' : 'application/json'});
      // res.end(JSON.stringify(results));
			res.json(results);
			// console.log(results);
    });
  });
};

// Insert Chat
exports.chat_user_pegawai = function(req,res){
	let userId = req.session.userId;
  if(userId == null){
		res.redirect("/");
		return;
  }
  let input = JSON.parse(JSON.stringify(req.body));
  req.getConnection(function (err, connection) {
    let data = {
      pengirim_pesan_chat_pengguna  : input.pengirim_pesan_chat_pengguna,
      penerima_pesan_chat_pengguna  : 'bot',
      isi_pesan_chat_pengguna       : sanitizer.escape(input.isi_pesan_chat_pengguna),
      waktu_pesan_chat_pengguna     : new Date(dt.now())
    };
    // connection.query("INSERT INTO pesan_chat_pengguna set ?",data,function  (err,rows) {
  	// if (err) throw err;
		// console.log("Pesan : '"+data.isi_pesan_chat_pengguna+"' Berhasil dikirim oleh '"+data.pengirim_pesan_chat_pengguna+"' ke '"+data.penerima_pesan_chat_pengguna+"'");
		// res.json('berhasil menyimpan, ini balasan bot');
    // });

		// RESPONSE
		let pesan = input.isi_pesan_chat_pengguna;
		if ( pesan.match(/(nomor|telepon|handphone|hp|telp)/gi) ) {
			str = pesan.split(' ');
			json = JSON.stringify(str);
			parse = JSON.parse(json);

			let data = {
	      pengirim_pesan_chat_pengguna  : input.pengirim_pesan_chat_pengguna,
	      penerima_pesan_chat_pengguna  : 'bot',
	      isi_pesan_chat_pengguna       : sanitizer.escape(input.isi_pesan_chat_pengguna),
	      waktu_pesan_chat_pengguna     : new Date(dt.now())
	    };

			var anyar = parse.splice(1);
			var objek = anyar.join(',').replace(/,/g, ' ').split();
			var objek2 = JSON.stringify(objek);

			console.log(parse);
			console.log(objek2);

			var query = connection.query("SELECT nip_pegawai,nama_pegawai FROM data_pegawai where nama_pegawai!='Administrator'",function(err,rows){
			if(err){
				console.log("Error Selecting : %s ",err );
				}
			else{
				for (var i = 0; i < rows.length; i++){
					let cocok = rows[i].nama_pegawai;
					var regex = new RegExp(cocok, 'gi'); //tidak ngaruh besar kecil nama yang diinputkan pengguna
				  if (objek2.match(regex)){
						let sql = "SELECT nama_pegawai,no_handphone_pegawai from data_pegawai where nama_pegawai=?";
						connection.query(sql, objek,function  (err,rows) {
				  	if (err){
							throw err;
						}
						else {
							console.log(rows);
							// console.log("Pesan : '"+data.isi_pesan_chat_pengguna+"' Berhasil dikirim oleh '"+data.pengirim_pesan_chat_pengguna+"' ke '"+data.penerima_pesan_chat_pengguna+"'");
							// res.json("Nomor Telepon Atas Nama "+rows[0].nama_pegawai+" : "+rows[0].no_handphone_pegawai);
							// console.log(rows[0].nama_pegawai);
						}
				    });
						console.log("================================================================");
		     		console.log("ketemu!");
						return false;
				  }
					else {
						console.log("tidak ketemu");
						return false;
					}
				}
			}
		 	});
		}
		else {
			console.log('tidak ada data');
		}
		// ./RESPONSE

		// res.end();
  });
};