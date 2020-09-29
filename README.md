# Montagsmaler

Lecture: **Software Development for Cloud Computing**  
Semester: **Summer 2020**  
Students: **Lucas Crämer (lc028), Jannik Smidt (js343), Niklas Schildhauer (ns107)**  
[Blogpost](https://blog.mi.hdm-stuttgart.de/index.php/2020/09/29/montagsmaler-multiplayer-online-game-running-on-amazon-web-services/), [Demovideo](https://www.youtube.com/watch?v=nuy7wBTjP4Q)  
  
## Project idea

Montagsmaler is a multiplayer online game for web browsers. The idea is derived from the classic Pictionary game, where players have to guess what one person is painting. Basically, we have built the digital version of it, but with one big difference: Not the players are guessing, the image recognition service from AWS is guessing. The game’s aim is to draw as good as possible so that the computer (an AWS service) can recognize what it is. All players are painting at the same time the same thing and after three rounds they see the paintings and the score they have got for it. 
  
## Goal

At the beginning of the course, neither of us had any experience in cloud development. For this lecture we developed Montagsmaler exclusively from scratch. During the project, we have learned and tested new concepts and deepened our skills in software engineering and cloud computing. This article should give you a brief overview of our app, its challenges and the corresponding solutions during development.
  
## Cloud-Components

### Amazon Cognito

Amazon Cognito is an AWS Service for user identification in the cloud. Cognito offers an API and SDKs for simple implementation for popular tech stacks.
We use Cognito for saving personal user data and handling the registration and authentication of the user accounts in our app. Cognito offers EMail verification for user accounts and state of the art token-based stateless authentication techniques. 
  
### Amazon S3

Amazon S3 is an object storage with a REST API. It offers high scalability, availability and fine granular access control. We use an S3 bucket to store the pictures which are saved during the games.
  
### Amazon Rekognition

Amazon Rekognition is an AWS Service for computer vision tasks. Like Cognito Rekogniton offers an API and SDKs for simple implementation for popular tech stacks. We use Rekognition for labelling the pictures during a game after they were stored in the S3 bucket. These labels are then used to calculate a score for the picture which was submitted. 
  
### Amazon ElastiCache (Redis)

Amazon Rekognition is an AWS Service for Redis. We wanted to use it in our architecture for a redis cluster, but since we do not have permission to start even a single ElastiCache Instance, we could not use it at the end.
  
### Amazon Elastic Container Service

Amazon Elastic Container Service is a highly scalable, container management service that makes it easy to run, stop, and manage containers on a cluster. We have one cluster and this cluster has one Elastic Container Service, which contains the core of our application the Montagsmaler API. Our application is continuously deployed with a Task Definition (more on that in CI-Components). This Task Definition deploys two docker containers. One container contains the Montagsmaler API. The other container contains a redis-server since we could not use the Amazon ElastiCache due to permission restrictions.
  
### Amazon Application Load Balancer

We use an Amazon Application Load Balancer which routes all the traffic to the Elastic Container Service. We currently only have one cluster with one service instance, so it fulfills the role of a reverse proxy as of right now. We can not use TLS encryption since we do not have permission to access the AWS Certificate Manager, which is kind of a bummer since it leads to popular browsers refusing to store the HTTP-only cookie containing the refresh token since we can not enable “SameSite: Secure”, which is required.
  
### Amazon Amplify

Amplify offers two products and functions: the Amplify Framework to create serverless backends and static web hosting. For us the static web hosting was interesting. We used it to host our angular frontend. It’s a simple tool which is connected to our github repository and automatically builds the master branch, when a new commit was made (more in CI-Components).
  
