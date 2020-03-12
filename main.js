function main() {
    var canvas = document.getElementById("canvas_main"), gl = canvas.getContext("webgl");

    var vertices = [
        -0.5, 0.5, 0.5,
        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,
        -0.5, 0.5, -0.5,
        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,
        0.5, 0.5, -0.5,
    ];
    var colors = [
        1.0, 0.0, 0.0, // RED
        0.0, 1.0, 0.0, // GREEN
        1.0, 1.0, 0.0, // YELLOW
        0.0, 0.0, 1.0, // BLUE
        1.0, 0.5, 0.0, // ORANGE
        1.0, 1.0, 1.0 // WHITE
    ];

    var geom = [];

    function quad(a, b, c, d) {
        var indices = [a, b, c, c, d, a];
        for (var i in indices) {
            geom.push(vertices[3*indices[i]], vertices[3*indices[i]+1], vertices[3*indices[i]+2]);
            geom.push(colors[3*a-3], colors[3*a-3+1], colors[3*a-3+2]);
        }
    }

    console.log(geom);

    quad(1, 2, 3, 0);
    quad(2, 6, 7, 3);
    quad(3, 7, 4, 0);
    quad(4, 5, 1, 0);
    quad(5, 4, 7, 6);
    quad(6, 2, 1, 5);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geom), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var vertexShaderCode = `
        precision mediump float;
        attribute vec3 aPosition;
        attribute vec3 aColor;
        varying vec3 vColor;
        float a = 60.0;
        float n = 0.1;
        float f = 50.0;
        float offset = 2.0;
        mat4 viewMatrix;
        void main(void) {
            vColor = aColor;
            a = a * 3.14159265 / 180.0;
            viewMatrix = mat4(
                    vec4(1.0/tan(a/2.0), 0.0, 0.0, 0.0),
                    vec4(0.0, 1.0/tan(a/2.0), 0.0, 0.0),
                    vec4(0.0, 0.0, (f+n)/(f-n), 2.0*f*n/(f-n)),
                    vec4(0.0, 0.0, -1.0, 0.0)
                );
            vec4 pos = vec4(aPosition.xy, aPosition.z - offset, 1.0) * viewMatrix;
            gl_Position = pos / pos.w;
        }
        `;

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderCode);
    gl.compileShader(vertexShader);
    
    var fragmentShaderCode = `
        precision mediump float;
        varying vec3 vColor;
        void main(void) {
            gl_FragColor = vec4(vColor, 1.0);
        }
        `;

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderCode);
    gl.compileShader(fragmentShader);

    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    var position = gl.getAttribLocation(shaderProgram, "aPosition");
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.enableVertexAttribArray(position);
    var color = gl.getAttribLocation(shaderProgram, "aColor");
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(color);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.drawArrays(gl.TRIANGLES, 0, 36);

}
