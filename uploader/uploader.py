import os.path
import re
import urllib.parse

import aiohttp
from izihawa_textutils.regex import DOI_REGEX


class ApiUploader:
    """A client for uploading files to the Nexus API with DOI identification.

    This class handles file uploads and DOI identification, with special support for
    Elsevier documents and general DOI-based files.
    """

    def __init__(self, nexus_user_id: str | int, nexus_auth_token: str):
        """Initialize the API uploader with authentication credentials.

        Args:
            nexus_user_id (str | int): The user ID for Nexus API authentication
            nexus_auth_token (str): The authentication token for Nexus API
        """
        self._nexus_user_id = str(nexus_user_id)
        self._nexus_auth_token = nexus_auth_token
        self._session = aiohttp.ClientSession()

    async def guess_external_id(self, file_path: str) -> str | None:
        """Attempt to extract or guess a DOI from the given file path.

        Supports Elsevier document IDs (starting with '1-s2.0') by querying CrossRef,
        and direct DOI matches in the filename.

        Args:
            file_path (str): Path to the file to analyze

        Returns:
            str | None: The identified DOI if found, None otherwise

        Raises:
            ValueError: If the file path doesn't include a file extension
        """
        base_name = os.path.basename(file_path)
        rsplitted = base_name.rsplit('.', 1)
        if len(rsplitted) < 2:
            raise ValueError('`file_path` should be a proper file with extension')
        # Elsevier
        if base_name.startswith('1-s2.0'):
            alternative_id = base_name[7:-10]
            async with self._session as session:
                crossref_response = await session.get(f'https://api.crossref.org/works/?filter=alternative-id:{alternative_id}')
                meta = await crossref_response.json()
                if meta['message']['items']:
                    return meta['message']['items'][0]['DOI']
        unquoted_file_name = urllib.parse.quote(file_path)
        if re.match(DOI_REGEX, base_name):
            return unquoted_file_name

    async def upload_file(self, file_path_or_data: str | bytes, external_id: str = None):
        """Upload a file to the Nexus API with associated DOI information.

        Args:
            file_path_or_data (str | bytes): Either a file path or the file content as bytes
            external_id (str, optional): The DOI or external identifier. If not provided,
                                       will attempt to guess from the file path.

        Raises:
            ValueError: If no DOI can be determined for the file
        """
        if not external_id and isinstance(file_path_or_data, str):
            external_id = await self.guess_external_id(file_path_or_data)
        if not external_id:
            raise ValueError("Can't figure out the DOI")

        form_data = aiohttp.FormData()
        form_data.add_field(
            'file',
            open(file_path_or_data, 'rb') if isinstance(file_path_or_data, str) else file_path_or_data,
            filename=urllib.parse.quote(external_id) + '.pdf',
        )
        form_data.add_field(
            'query',
            external_id,
        )
        async with self._session as session:
            await session.post(
                'https://api.libstc.cc/upload/',
                headers={
                    'X-Nexus-User-Id': self._nexus_user_id,
                    'X-Nexus-Auth-Token': self._nexus_auth_token,
                },
                data=form_data,
            )
