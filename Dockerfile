##Build Stage
## 아래 이미지로 빌드를 수행하고 빌드 결과외 모든 파일을 삭제 함

#빌드할 이미지 node:16
FROM node:16 AS builder
#작업폴더(CD)
WORKDIR /app
#현재디렉토리에 있는 모든것을 컨테이너 내부에 복사
COPY . .
#빌드 완료 후 삭제할 현재 파일과 디렉토리 리스트 저장
RUN ls > list
#npm install
RUN npm ci --force
#npm build
RUN npm run build
#처음 만들어놨던 list상 모든 파일과 폴더 삭제, list파일 삭제
RUN rm -rf `cat list` && rm -rf list

##Run Stage
##빌드 스테이지에서 만들어진 node_modules, dist 파일을 복사 해와서 실행 함
##node 유저로 실행하며 파일/폴더 권한은 root라 권한이 필요하면 퍼미션 변경 작업 추가 필요
#실행은 불필요한게 안깔려있는 alpine 이미지에서 수행
FROM node:16-alpine
#작업폴더 지정
WORKDIR /app
#build이미지에서 생성된 빌드 결과물을 복사
COPY --from=builder /app/ ./
#아래작업부터는 node유저로 수행됨
USER node
#서비스 기동 명령어(컨테이너의 1번 PID로 기동됨)
CMD ["node", "dist/src/main"]
