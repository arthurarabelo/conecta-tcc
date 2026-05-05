<?php

namespace Tests\Feature\Application;

use App\Models\Application;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApproveApplicationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return void
     */
    public function test_professor_can_approve_application(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $token = $professor->createToken('api')->plainTextToken;
        $proposal = Proposal::factory()->create(['professor_id' => $professor->id, 'max_slots' => 2]);
        $application = Application::factory()->create(['proposal_id' => $proposal->id]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/applications/{$application->id}/approve");

        $response->assertStatus(200)
            ->assertJsonFragment(['status' => 'approved']);

        $this->assertDatabaseHas('applications', [
            'id' => $application->id,
            'status' => 'approved',
        ]);
    }

    /**
     * @return void
     */
    public function test_proposal_closes_when_last_slot_is_filled(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $token = $professor->createToken('api')->plainTextToken;
        $proposal = Proposal::factory()->create(['professor_id' => $professor->id, 'max_slots' => 1]);
        $application = Application::factory()->create(['proposal_id' => $proposal->id]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/applications/{$application->id}/approve")
            ->assertStatus(200);

        $this->assertDatabaseHas('proposals', [
            'id' => $proposal->id,
            'status' => 'closed',
        ]);
    }

    /**
     * @return void
     */
    public function test_professor_cannot_approve_application_for_another_professors_proposal(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $other = User::factory()->create(['role' => 'professor']);
        $token = $other->createToken('api')->plainTextToken;
        $application = Application::factory()->create([
            'proposal_id' => Proposal::factory()->create(['professor_id' => $professor->id])->id,
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/applications/{$application->id}/approve")
            ->assertStatus(403);
    }

    /**
     * @return void
     */
    public function test_cannot_approve_when_no_slots_available(): void
    {
        $professor = User::factory()->create(['role' => 'professor']);
        $token = $professor->createToken('api')->plainTextToken;
        $proposal = Proposal::factory()->create(['professor_id' => $professor->id, 'max_slots' => 1]);

        Application::factory()->create(['proposal_id' => $proposal->id, 'status' => 'approved']);
        $application = Application::factory()->create([
            'student_id' => User::factory()->create(['role' => 'student'])->id,
            'proposal_id' => $proposal->id,
        ]);

        $this->withHeader('Authorization', "Bearer {$token}")
            ->patchJson("/api/applications/{$application->id}/approve")
            ->assertStatus(422)
            ->assertJsonFragment(['message' => 'Não há vagas disponíveis.']);
    }

    /**
     * @return void
     */
    public function test_unauthenticated_user_cannot_approve(): void
    {
        $application = Application::factory()->create();

        $this->patchJson("/api/applications/{$application->id}/approve")->assertStatus(401);
    }
}
