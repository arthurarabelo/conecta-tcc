<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ApproveApplicationRequest extends FormRequest
{
    /**
     * @return bool
     */
    public function authorize(): bool
    {
        $application = $this->route('application');

        return $this->user()->id === $application->proposal->professor_id;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [];
    }
}
