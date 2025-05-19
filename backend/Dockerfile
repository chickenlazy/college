FROM eclipse-temurin:17-jdk as build
WORKDIR /workspace/app

# Sao chép Gradle wrapper và build files
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY src src

# Phân quyền thực thi cho gradlew
RUN chmod +x gradlew

# Build ứng dụng
RUN ./gradlew build -x test

# Stage chạy ứng dụng
FROM eclipse-temurin:17-jre
VOLUME /tmp
COPY --from=build /workspace/app/build/libs/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]