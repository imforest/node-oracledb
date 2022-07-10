var oracledb = require('oracledb');
var dbConfig = require('./config/dbConfig');
// Express 기본 모듈 불러오기
var express = require('express'),
    http = require('http'),
    path = require('path');

// 익스프레스 객체 생성
var app = express();

// 기본 속성 설정
app.set('port', process.env.PORT || 3000);

// body-parser
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// 라우터 객체 참조
var router = express.Router();

// mybatis-mapper 추가
var mybatisMapper = require('mybatis-mapper');

// Mapper Load
mybatisMapper.createMapper(['./mapper/oracle-mapper.xml']);

// Oracle Auto Commit 설정
oracledb.autoCommit = true;

// 데이터 조회 처리
router.post('/dbTestSelect', function(request, response) {

    oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        },
        function(err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }

            //조회할 파라미터
            var param = {
                empno: request.body.empno
            }

            // 쿼리문 형식
            let format = {
                language: 'sql',
                indent: '  '
            };
            //첫번째는 xml의 namespace, 두번째는 해당 xml id값, 세번째는 파라미터, 마지막은 포맷.
            let query = mybatisMapper.getStatement('oracleMapper', 'selectEmpInfo', param, format);

            console.log(query); // 쿼리 출력

            connection.execute(query, [], function(err, result) {
                if (err) {
                    console.error(err.message);
                    doRelease(connection);
                    return;
                }
                console.log(result.rows); // 데이터
                doRelease(response, connection, result.rows); // Connection 해제
            });
        });
});


// 데이터 입력 처리
router.post('/dbTestInsert', function(request, response) {

    oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        },
        function(err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }

            //조회할 파라미터
            var param = {
                empno: Number(request.body.empno),
                ename: request.body.ename,
                job: request.body.job,
                mgr: request.body.mgr,
                sal: Number(request.body.sal),
                comm: Number(request.body.comm),
                deptno: Number(request.body.deptno)
            }

            // 쿼리문 형식
            let format = {
                language: 'sql',
                indent: '  '
            };
            //첫번째는 xml의 namespace, 두번째는 해당 xml id값, 세번째는 파라미터, 마지막은 포맷.
            let query = mybatisMapper.getStatement('oracleMapper', 'insertEmpInfo', param, format);

            console.log(query); // 쿼리 출력

            connection.execute(query, [], function(err, result) {
                if (err) {
                    console.error(err.message);
                    doRelease(connection);
                    return;
                }
                console.log('Row Insert: ' + result.rowsAffected);
                doRelease(response, connection, result.rowsAffected); // Connection 해제
            });
        });

});


// DB 연결 해제
function doRelease(response, connection, result) {
    connection.release(function(err) {
        if (err) {
            console.error(err.message);
        }

        // DB종료까지 모두 완료되었을 시 응답 데이터 반환
        response.send('' + result);
    });
}

// 라우터 객체를 app 객체에 등록
app.use('/', router);


// 등록되지 않은 패스에 대해 페이지 오류 응답
app.all('*', function(req, res) {
    res.status(404).send('<h1>ERROR - 페이지를 찾을 수 없습니다.</h1>');
});


// Express 서버 시작
http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

// 예상치 못한 에러처리
process.on("uncaughtException", function(err) {
    //비정상 에러시 로그를 넘길 수 있도록 timeout을 준다. 
    setTimeout(function() {
        logger.error("[[[ Uncaught Exception ]]]\n" + err.stack);
    }, 1000);
});
