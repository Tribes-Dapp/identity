# syntax=docker/dockerfile:1

FROM golang:latest

WORKDIR /polygon

COPY /utils/transformations .

RUN go mod tidy

CMD ["go", "run", "main.go"]