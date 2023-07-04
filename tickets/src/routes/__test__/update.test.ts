import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";

it("return 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "asdasd",
      price: 20,
    })
    .expect(404);
});

it("return 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "asdasd",
      price: 20,
    })
    .expect(401);
});

it("return 401 if the user does not own the ticket", async () => {
  const resposne = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title: "asdasd",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${resposne.body.id}`)
    .set("Cookie", global.signin())
    .send({
      title: "asdasd",
      price: 2000,
    })
    .expect(401);
});

it("return a 400 if the user provides an invalid title or price", async () => {
  const cookie = global.signin();

  const resposne = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asdasd",
      price: 20,
    });

  await request(app)
    .put(`/api/tickets/${resposne.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${resposne.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "asdsad",
      price: -10,
    })
    .expect(400);
});

it("updates the ticket provided valid inputs", async () => {
  const cookie = global.signin();

  const resposne = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asdsad",
      price: 100,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${resposne.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "asdsad",
      price: 10,
    })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${resposne.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual("asdsad");
  expect(ticketResponse.body.price).toEqual(10);
});

it("publishes an event", async () => {
  const cookie = global.signin();

  const resposne = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asdsad",
      price: 100,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${resposne.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "asdsad",
      price: 10,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
