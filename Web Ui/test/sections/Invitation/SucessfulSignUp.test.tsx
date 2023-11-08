import { render, fireEvent , waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import { mockUserCredentials } from './__mocks__/userCredentials';
import SuccessfulSignUpPopUp from '../../../src/sections/Invitation/components/SuccessfulSignUpPopUp';

describe('Succesful Sign Up Pop up component', () => {
    it('Renders basic components', () => {
        const { getByText } = render(<SuccessfulSignUpPopUp 
            photoAccount={mockUserCredentials.photoURL}
            nameAccount={mockUserCredentials.displayName}
        />);
        const title = getByText(/Inicio de Sesión Exitoso/);
        const acceptButton = getByText("Aceptar");
        expect(title).toBeInTheDocument();
        expect(acceptButton).toBeInTheDocument();
    });
    it('Renders mock credentials', () => {
        const { getByText, getByRole} = render(<SuccessfulSignUpPopUp 
            photoAccount={mockUserCredentials.photoURL}
            nameAccount={mockUserCredentials.displayName}
        />);
        const imageElement = getByRole("img");
        const nameAccount = getByText(`${mockUserCredentials.displayName}`);
        expect(imageElement).toHaveAttribute('src', mockUserCredentials.photoURL);
        expect(nameAccount).toBeInTheDocument();
    });
    it('Renders click accept button', () => {
        const {  getByText} = render(<SuccessfulSignUpPopUp 
            photoAccount={mockUserCredentials.photoURL}
            nameAccount={mockUserCredentials.displayName}
        />);
        waitFor(() => {
            const acceptButton = getByText('Aceptar');
            expect(acceptButton).toBeInTheDocument();
            const open = true;
            fireEvent.click(acceptButton);
            expect(open).toBe(false);
        })
    });
});