
// Static class, just call the functions directly without instantiating a MeshLoader
a3d.MeshLoader = {
	  newMesh: function(name, vs, vns, uvs, fs, fns) {
		var md = new a3d.MeshData();
		md.vs = vs; md.vns = vns; md.uvs = uvs; md.fs = fs; md.fns = fns;
		var m = new a3d.Mesh({data: md});
		m.name = name;
		
		return m;
	}
	, parseOBJ: function(obj) {
		var vs = [], vns = [], uvs = [], fs = [], fns = [];
		
		var lines = obj.split("\n");
		var lineCount = lines.length;
		var dblSpace = /[ ][ ]/g;
		var objs = [];
		
		for (var i = 0; i < lineCount; ++i) {
			var line = lines[i];
			if (line.length == 0) continue;
			if (line[1] == '#') continue;
			
			var l2 = line.substr(0, 2);
			switch (l2) {
				case 'o ': {
					var name = a3d.trim(line.substr(2));
					if (vs.length > 0 && objs.length == 0) {	// Handle data before the first named object
						var m = this.newMesh('[noname]', vs, vns, uvs, fs, fns);
						objs.push(m);
					}
					//vs = []; vns = []; uvs = []; fs = []; fns = [];
					fs = []; fns = [];
					var m = this.newMesh(name, vs, vns, uvs, fs, fns);
					objs.push(m);
					
					break;
				}
				case 'v ': {
					var xyz = a3d.trim(line.substr(2).replace(dblSpace, ' ')).split(' ');
					//var col = new a3d.Color(Math.random()*0xFFFFFF);
					var col = a3d.DarkGray;
					var v = new a3d.Vert(parseFloat(xyz[0]), -parseFloat(xyz[1]), parseFloat(xyz[2]), col);
					vs.push(v);
					break;
				}
				case 'vn': {
					var xyz = a3d.trim(line.substr(3).replace(dblSpace, ' ')).split(' ');
					var vn = new a3d.Vec3(parseFloat(xyz[0]), parseFloat(xyz[1]), parseFloat(xyz[2]));
					vn.norm();
					vns.push(vn);
					break;
				}
				case 'vt': {
					var xy = a3d.trim(line.substr(3).replace(dblSpace, ' ')).split(' ');
					var uv = new a3d.UV(parseFloat(xy[0]), parseFloat(xy[1]));
					uvs.push(uv);
					break;
				}
				case 'f ': {
					var vvv = a3d.trim(line.substr(2).replace(dblSpace, ' ')).split(' ');
					var vvvl = vvv.length;
					
					var fvs = [], fuvs = [], fvns = [];
					for (var j = 0; j < vvvl; ++j) {
						var sub = vvv[j].split('/');
						var subl = sub.length;
						
						fvs.push(vs[parseInt(sub[0]) - 1]);
						if (subl > 1 && sub[1].length) {
							fuvs.push(uvs[parseInt(sub[1]) - 1]);
						}
						if (subl > 2 && sub[2].length) {
							fns.push(vns[parseInt(sub[2]) - 1]);
						}
					}
					//console.log(vvvl);
					if (vvvl == 3) {
						fs.push(new a3d.Triangle(fvs[0], fvs[1], fvs[2], fuvs[0], fuvs[1], fuvs[2]));
					} else {
						fs.push(new a3d.Triangle(fvs[0], fvs[1], fvs[3], fuvs[0], fuvs[1], fuvs[3]));
						fs.push(new a3d.Triangle(fvs[1], fvs[2], fvs[3], fuvs[1], fuvs[2], fuvs[3]));
					}
					break;
				}
			}
		}
		
		if (vs.length > 0 && objs.length == 0) {	// Handle data not in a named object
			var m = this.newMesh('[noname]', vs, vns, uvs, fs, fns);
			m.shader = new a3d.TextureShader();
			objs.push(m);
		}
		
		var objl = objs.length;
		for (var i = 0; i < objl; ++i) {
			//objs[i].data.fs = objs[i].data.fs.slice(0, 50);
			//objs[i].data.fs = objs[i].data.fs.slice(0, 1);
			objs[i].build();
		}
		
		return objs;
	}
	
	// Optionally lets you specify your own loadFunc to let jQuery or your favorite lib do the work.
	// Just make sure its params are: url, successFunc, failFunc
	, loadOBJ: function(url, success, fail, loadFunc) {
		if (!loadFunc) loadFunc = a3d.get;
		
		var objData = loadFunc(url, function(data) {
			if (success) success(a3d.MeshLoader.parseOBJ(data));
		}, function() {
			if (fail) fail(null);
		});
	}
};

a3d.MeshData = Class.extend({
	  vs: []	// verts
	, vns: []	// vert normals
	, uvs: []	// UV coords
	, fs: []	// faces
	, fns: []	// face normals
	
	, init: function() {
		this.clear();	// must do this the first time, so that Class variables arent referenced
	}
	, clear: function() {
		this.vs = []; this.vns = []; this.uvs = [];
		this.fs = []; this.fns = [];
	}
});