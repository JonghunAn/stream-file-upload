import { SortType } from 'src/domain/generic/ws/constant/sort-type.enum';

export interface IFilter {
  fromTimestamp: number;
  toTimestamp: number;
  limit?: number;
  sort?: SortType;
}

export interface IFetchTopicsMessagesFilter extends IFilter {
  subDID: string;
}
