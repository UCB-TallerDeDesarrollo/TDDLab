import AuthComponent from '../../../src/sections/Invitation/InvitationPage';
import { render} from '@testing-library/react';
import '@testing-library/jest-dom';

describe('InvitationPage component', () => {
    it('Renders the Sign Up button', () => {
        const { getByText } = render(<AuthComponent/>);
        const signUpButton = getByText('Registrarse');
        expect(signUpButton).toBeInTheDocument();
    });
});