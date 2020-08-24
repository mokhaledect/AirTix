import request from 'supertest';
import { app } from '../../app';
import { signin } from '../../test/helpers';
import { Ticket } from '../../models/ticket';

it('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app).post('/api/tickets').send({});
    expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
    const response = await request(app).post('/api/tickets').send({}).expect(401);
});

it('returns a status other that 401 if user is signed in', async () => {
    const cookie = await signin();
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({});
    expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
    const cookie = await signin();
    await request(app)
        .post('/api/tickets')
        .set('Cookie', await signin())
        .send({
            title: '',
            price: 10,
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', await signin())
        .send({
            price: 10,
        })
        .expect(400);
});
it('returns an error if an invalid price is provided', async () => {
    const cookie = await signin();
    await request(app)
        .post('/api/tickets')
        .set('Cookie', await signin())
        .send({
            title: 'test title',
            price: -10,
        })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', await signin())
        .send({
            title: 'test title'
        })
        .expect(400);
});

it('creates a ticket with valid inputs', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', await signin())
        .send({
            title: 'test title',
            price: 20,
        })
        .expect(201);
    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
});