import { AExchangeable } from "./AExchangable.js";
import { Client } from "./Client.js";

export class Profile extends AExchangeable
{
	/**
	 * @param  {Client} client
	 */
	constructor (client, username, id, avatar)
	{
		super();
		this.client = client;
		this.username = username;
		this.id = id;
		this.avatar = avatar;
		this.online = null;
		this.isFriend;
		this.isBlocked;
		this.hasIncomingRequest;
		this.hasOutgoingRequest;
	}
	async init()
	{
		let response;
		if (this.username !== undefined)
			response = await this.client._get(`/api/profiles/user/${this.username}`);
		else 
			response = await this.client._get(`/api/profiles/id/${this.id}`);

		if (response.status !== 200)
			return response.status;

		const responseData = await response.json();
		this.id = responseData.id;
		this.username = responseData.username;
		this.avatar = responseData.avatar;
		this.online = responseData.online

		if (!this.client.me || this.client.me.id === this.id)
			return;

		this.hasIncomingRequest = responseData.has_incoming_request;
		this.hasOutgoingRequest = responseData.has_outgoing_request;
		this.isFriend = responseData.is_friend;
		this.isBlocked = this.client.me._isBlocked(this);
	}

	async getGameHistory()
	{
		const response = await this.client._get(`/api/games/history/${this.id}`);
		const response_data = await response.json();

		const games = [];

		response_data.forEach(game_data => {
			games.push(game_data);
		});

		return games;
	}

	export(additionalFieldList = [])
	{
		super.export([...["username", "avatar", "id"], ...additionalFieldList])
	}
}
