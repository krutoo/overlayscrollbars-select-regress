import { useState } from 'react';
import { Select, Option } from './Select';

export function App() {
  const [value, setValue] = useState('');

  const options = (
    <>
      <Option value='One'>One</Option>
      <Option value='Two'>Two</Option>
      <Option value='Three'>Three</Option>
      <Option value='Four'>Four</Option>
      <Option value='Five'>Five</Option>
      <Option value='Six'>Six</Option>
      <Option value='Seven'>Seven</Option>
      <Option value='Eight'>Eight</Option>
      <Option value='Nine'>Nine</Option>
      <Option value='Ten'>Ten</Option>
    </>
  );

  return (
    <div className='content'>
      <h1>Example of Select component with overlayscrollbars</h1>

      <Select value={value} onChange={setValue} menuScrollImplementation='native'>
        {options}
      </Select>

      <Select value={value} onChange={setValue} menuScrollImplementation='overlayscrollbars'>
        {options}
      </Select>
    </div>
  );
}
