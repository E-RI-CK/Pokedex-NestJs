import { InjectModel } from '@nestjs/mongoose';
import { PokeResponse } from './interfaces/poke-response.interface';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Injectable } from '@nestjs/common';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly pokemonAdapter: AxiosAdapter
  ) { }

  async executeSeed() {

    await this.pokemonModel.deleteMany({});

    const data = await this.pokemonAdapter.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    // const insertPromisesArray: Promise<any>[] = [];

    const pokemonsToInsert: { name: string, no: number }[] = [];

    data.results.forEach(({ name, url }) => {
      const no = url.split('/').at(-2);
      const pokemon: CreatePokemonDto = { no: Number(no), name };
      // await this.pokemonModel.create(pokemon);
      // insertPromisesArray.push(this.pokemonModel.create(pokemon));
      pokemonsToInsert.push(pokemon);
    });

    await this.pokemonModel.insertMany(pokemonsToInsert);

    // const newArray = await Promise.all(insertPromisesArray);

    return "Seed Executed";
  }


}
