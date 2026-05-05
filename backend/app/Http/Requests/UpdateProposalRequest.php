<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProposalRequest extends FormRequest
{
    /**
     * @return bool
     */
    public function authorize(): bool
    {
        $proposal = $this->route('proposal');

        return $this->user()->id === $proposal->professor_id;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'prerequisites' => 'nullable|string',
            'max_slots' => 'sometimes|integer|min:1',
            'department_id' => 'nullable|exists:departments,id',
            'area_id' => 'nullable|exists:knowledge_areas,id',
            'status' => 'sometimes|in:open,closed',
        ];
    }
}
