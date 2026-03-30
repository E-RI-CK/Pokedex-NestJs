import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptionError('create', error);
    }

  };

  async findAll({ limit = 10, offset = 0 }: PaginationDto) {
    const pokemons = await this.pokemonModel.find().skip(offset).limit(limit).sort({ no: 1 }).select('-__v');
    if (!pokemons) throw new NotFoundException(`There are no Pokemons`)
    return pokemons;
  };

  async findOne(term: string) {

    let pokemon: Pokemon | null = null;

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: +term });
    }

    else if (isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    else {
      pokemon = await this.pokemonModel.findOne({ name: term.toLocaleLowerCase().trim() });
    }

    if (!pokemon) throw new NotFoundException(`Pokemon with term "${term}" not found`);

    return pokemon;

  };

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    if (Object.keys(updatePokemonDto).length === 0) throw new BadRequestException(`Body must receive at least one parameter`);

    const pokemon = await this.findOne(term);

    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase().trim();
    }

    try {

      Object.assign(pokemon, updatePokemonDto);
      await pokemon.save();

      return pokemon;

    } catch (error) {

      this.handleExceptionError('update', error);

    }
  };

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();

    const pokemon = await this.pokemonModel.deleteOne({ _id: id });

    if (pokemon.deletedCount === 0) throw new BadRequestException(`Pokemon with id ${id} not found`);

    return pokemon;
  };

  private handleExceptionError(method: string = 'process', error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Duplicate value: ${JSON.stringify(error.keyValue)}`);
    }

    throw new InternalServerErrorException(`Can't ${method} pokemon - Check server logs`)
  }
};
