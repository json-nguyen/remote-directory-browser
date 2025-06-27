import styled from 'styled-components';

interface SearchInputProps {
  searchValue: string;
  setSearchValue: (value: string) => void;
}

const StyledInput = styled.input`
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #d1d5db;
  border-radius: 9999px;
  outline: none;
  transition: border-color 0.2s ease-in-out;

  &:focus {
    border-color: #6366f1;
  }
`;

const SearchInput = ({ searchValue, setSearchValue }: SearchInputProps) => {
  return (
    <StyledInput
      type="text"
      value={searchValue}
      onChange={e => setSearchValue(e.target.value)}
      placeholder="Search..."
    />
  );
};

export default SearchInput;
