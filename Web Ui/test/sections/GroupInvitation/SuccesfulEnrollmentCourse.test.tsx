import { render, fireEvent , waitFor} from '@testing-library/react';
import '@testing-library/jest-dom';
import SuccessfulEnrollmentPopUp from '../../../src/sections/GroupInvitation/components/SuccessfulEnrollmentPopUp';
import { MemoryRouter } from 'react-router-dom';

jest.mock('axios');

describe('Succesful Sign Up Pop up component', () => {
    it('Renders basic components', () => {
        const { getByText } = render(
            <MemoryRouter>
                <SuccessfulEnrollmentPopUp/>
            </MemoryRouter>
        );
        const title = getByText(/Inscripción Exitosa/);
        const body = getByText(/Ahora eres parte del grupo/);
        const acceptButton = getByText("Aceptar");
        expect(title).toBeInTheDocument();
        expect(body).toBeInTheDocument();
        expect(acceptButton).toBeInTheDocument();
    });

    it('Renders click accept button', async () => {
        const { getByText } = render(
            <MemoryRouter>
                <SuccessfulEnrollmentPopUp/>
            </MemoryRouter>
        );
        await waitFor(() => {
            const acceptButton = getByText('Aceptar');
            expect(acceptButton).toBeInTheDocument();
            const open = true;
            fireEvent.click(acceptButton);
            expect(open).toBe(false);
        });
    });

    it('Renders click accept button and go to homepage', async () => {
        const { getByText } = render(
            <MemoryRouter>
                <SuccessfulEnrollmentPopUp/>
            </MemoryRouter>
        );
        await waitFor(() => {
            const acceptButton = getByText('Aceptar');
            expect(acceptButton).toBeInTheDocument();
            const oldPathname = window.location.pathname;
            fireEvent.click(acceptButton);
            const newPathname = window.location.pathname;
            const expectedLastPart = '';
            const actualLastPart = newPathname.substring(newPathname.lastIndexOf('/') + 1);
            expect(oldPathname).not.toBe(newPathname);
            expect(actualLastPart).toBe(expectedLastPart);
        });
    });
});