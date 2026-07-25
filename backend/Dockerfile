# Build stage
FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
COPY src ./src
COPY data ./data
COPY pdf_template.html ./

RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar
COPY --from=build /app/pdf_template.html ./pdf_template.html
COPY --from=build /app/data ./data

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]
