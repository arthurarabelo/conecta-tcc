<?php

namespace Tests\Feature\Proposal;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StoreProposalTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return void
     */
    public function test_professor_can_create_proposal(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $token = $professor->createToken('api')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/proposals', [
                'title' => 'Pesquisa em IA',
                'description' => 'Estudo sobre modelos de linguagem.',
                'max_slots' => 3,
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'title',
                'description',
                'max_slots',
                'status',
                'professor_id',
                'professor',
            ])
            ->assertJsonFragment([
                'title' => 'Pesquisa em IA',
                'professor_id' => $professor->id,
                'status' => 'open',
            ]);

        $this->assertDatabaseHas('proposals', [
            'title' => 'Pesquisa em IA',
            'professor_id' => $professor->id,
        ]);
    }

    /**
     * @return void
     */
    public function test_student_cannot_create_proposal(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $token = $student->createToken('api')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/proposals', [
                'title' => 'Pesquisa em IA',
                'description' => 'Estudo sobre modelos de linguagem.',
                'max_slots' => 3,
            ]);

        $response->assertStatus(403);
    }

    /**
     * @return void
     */
    public function test_unauthenticated_user_cannot_create_proposal(): void
    {
        $this->postJson('/api/proposals', [
            'title' => 'Pesquisa em IA',
            'description' => 'Estudo sobre modelos de linguagem.',
            'max_slots' => 3,
        ])->assertStatus(401);
    }

    /**
     * @return void
     */
    public function test_create_proposal_requires_title_description_and_max_slots(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $token = $professor->createToken('api')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/proposals', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['title', 'description', 'max_slots']);
    }
}
